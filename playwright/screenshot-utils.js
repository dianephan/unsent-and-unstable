/**
 * Screenshot utility adapted from launchdarkly/ld-docs-private.
 * Takes screenshots of locators and only saves them if they differ
 * from existing screenshots (pixel-level diff via pixelmatch).
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const SCREENSHOT_PATH = path.join(__dirname, 'screenshots');
const METADATA_PATH = path.join(__dirname, 'screenshot-metadata.json');
const PIXEL_DIFF_THRESHOLD_PCT = 0.1;
const IMAGE_EXTENSION = '.png';

const DEFAULT_PADDING = { left: 0, right: 0, top: 0, bottom: 0 };
const DEFAULT_HIGHLIGHT_MARGIN = 10;
const DEFAULT_HIGHLIGHT_Z_INDEX = 1000;
const HIGHLIGHT_CLASS_NAME = '__docs-highlight';

const addHighlightToPage = async (page, highlight, highlightZIndex, highlightMargin) => {
  const boundingBox = await highlight.boundingBox();
  if (!boundingBox) return;
  return page.evaluate(
    ({ box, margin, className, zIndex }) => {
      const div = document.createElement('div');
      div.className = className;
      div.style.cssText = `
        height: ${box.height + 2 * margin}px;
        width: ${box.width + 2 * margin}px;
        top: ${Math.max(box.y - margin, 0)}px;
        left: ${Math.max(box.x - margin, 0)}px;
        position: absolute;
        z-index: ${zIndex};
        border: 4px solid red;
      `;
      document.body.appendChild(div);
    },
    {
      box: boundingBox,
      margin: highlightMargin || DEFAULT_HIGHLIGHT_MARGIN,
      className: HIGHLIGHT_CLASS_NAME,
      zIndex: highlightZIndex || DEFAULT_HIGHLIGHT_Z_INDEX,
    },
  );
};

const removeHighlightsFromPage = async (page) => {
  return page.evaluate(
    ({ className }) => {
      const highlights = document.getElementsByClassName(className);
      for (const highlight of Array.from(highlights)) {
        highlight.remove();
      }
    },
    { className: HIGHLIGHT_CLASS_NAME },
  );
};

const captureScreenshotWithPadding = async (locator, padding, highlight, highlightZIndex, highlightMargin) => {
  await locator.scrollIntoViewIfNeeded();
  const boundingBox = await locator.boundingBox();
  if (!boundingBox || !boundingBox.width || !boundingBox.height) {
    throw new Error('Cannot take screenshot - invalid bounding box');
  }

  const page = locator.page();
  if (highlight) {
    for (const h of highlight) {
      await addHighlightToPage(page, h, highlightZIndex, highlightMargin);
    }
  }

  const screenshot = await page.screenshot({
    clip: {
      x: Math.max(boundingBox.x - padding.left, 0),
      y: Math.max(boundingBox.y - padding.top, 0),
      width: boundingBox.width + padding.left + padding.right,
      height: boundingBox.height + padding.top + padding.bottom,
    },
  });

  await removeHighlightsFromPage(page);
  return screenshot;
};

const areImagesDifferent = (existingImage, newImage) => {
  const { width, height } = existingImage;
  const differentPixels = pixelmatch(existingImage.data, newImage.data, null, width, height);
  const differentPixelPercent = (differentPixels / (width * height)) * 100;
  if (differentPixelPercent > PIXEL_DIFF_THRESHOLD_PCT) {
    return { different: true, percentDifferent: differentPixelPercent };
  }
  return { different: false, percentDifferent: differentPixelPercent };
};

const saveScreenshot = (filename, buffer) => {
  console.log(`Saving ${filename}`);
  return fs.writeFileSync(filename, buffer);
};

const updateMetadata = (entry) => {
  const exists = fs.existsSync(METADATA_PATH);
  const metadata = exists ? JSON.parse(fs.readFileSync(METADATA_PATH).toString()) : {};
  metadata[entry.filename] = entry;
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, undefined, 2), 'utf-8');
};

/**
 * Take a screenshot of a locator and save it if it differs from the existing one.
 *
 * @param {import('@playwright/test').Locator} locator - Element to screenshot
 * @param {string} imageFilename - Filename (e.g. 'chapter-1-letter.png')
 * @param {object} [options]
 * @param {object} [options.padding] - Extra padding around the locator {left, right, top, bottom}
 * @param {import('@playwright/test').Locator[]} [options.highlight] - Locators to highlight with red border
 * @param {number} [options.highlightZIndex]
 * @param {number} [options.highlightMargin]
 */
const takeScreenshotForDocs = async (locator, imageFilename, options) => {
  const padding = { ...DEFAULT_PADDING, ...(options?.padding || {}) };
  const newImageBuffer = await captureScreenshotWithPadding(
    locator,
    padding,
    options?.highlight,
    options?.highlightZIndex,
    options?.highlightMargin,
  );

  const filename = imageFilename.replace('.png', IMAGE_EXTENSION);
  const fullFilename = path.join(SCREENSHOT_PATH, filename);

  if (!fs.existsSync(SCREENSHOT_PATH)) {
    fs.mkdirSync(SCREENSHOT_PATH, { recursive: true });
  }

  if (!fs.existsSync(fullFilename)) {
    console.log(`${fullFilename} does not yet exist. Saving`);
    updateMetadata({ filename, previouslyExisted: false, saved: true });
    return saveScreenshot(fullFilename, newImageBuffer);
  }

  try {
    const existingImage = PNG.sync.read(fs.readFileSync(fullFilename));
    const newImage = PNG.sync.read(newImageBuffer);

    if (newImage.width !== existingImage.width || newImage.height !== existingImage.height) {
      console.log(`${filename} - Image sizes are different. Saving`);
      updateMetadata({ filename, previouslyExisted: true, saved: true, imageSizesAreDifferent: true });
      return saveScreenshot(fullFilename, newImageBuffer);
    }

    const { different, percentDifferent } = areImagesDifferent(existingImage, newImage);
    const alwaysSave = process.env.ALWAYS_SAVE === '1';
    console.log(
      `${filename} Difference: ${percentDifferent.toFixed(2)}%. ${different || alwaysSave ? 'Saving' : 'Not saving'}`,
    );
    updateMetadata({ filename, saved: different || alwaysSave, previouslyExisted: true, percentDifferent });

    if (different || alwaysSave) {
      return saveScreenshot(fullFilename, newImageBuffer);
    }
  } catch (error) {
    console.log(`${filename} Problem comparing images. Saving new one. ${error}`);
    return saveScreenshot(fullFilename, newImageBuffer);
  }
};

module.exports = { takeScreenshotForDocs, SCREENSHOT_PATH, METADATA_PATH };
