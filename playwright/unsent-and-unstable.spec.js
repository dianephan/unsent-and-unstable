const { test, expect } = require('@playwright/test');
const { takeScreenshotForDocs } = require('./screenshot-utils');

test.describe('Unsent and Unstable - Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Full page screenshot', async ({ page }) => {
    await takeScreenshotForDocs(page.locator('body'), 'full-page.png', {
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    });
  });

  test('Chapter I - The Letter', async ({ page }) => {
    const card = page.locator('.chapter-card').nth(0);
    await expect(card.locator('h2')).toContainText('Chapter I');
    await takeScreenshotForDocs(card, 'chapter-1-letter.png', {
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    });
  });

  test('Chapter II - The Proposal', async ({ page }) => {
    const card = page.locator('.chapter-card').nth(1);
    await expect(card.locator('h2')).toContainText('Chapter II');
    await takeScreenshotForDocs(card, 'chapter-2-proposal.png', {
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    });
  });

  test('Chapter III - The Flaky Invitation', async ({ page }) => {
    const card = page.locator('.chapter-card').nth(2);
    await expect(card.locator('h2')).toContainText('Chapter III');
    await takeScreenshotForDocs(card, 'chapter-3-invitation.png', {
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    });
  });

  test('Chapter IV - The Staging Environment', async ({ page }) => {
    const card = page.locator('.chapter-card').nth(3);
    await expect(card.locator('h2')).toContainText('Chapter IV');
    await takeScreenshotForDocs(card, 'chapter-4-staging.png', {
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    });
  });

  test('Chapter V - Test Results Dashboard', async ({ page }) => {
    const dashboard = page.locator('.test-dashboard');
    await expect(dashboard.locator('h3')).toContainText('Chapter V');
    await takeScreenshotForDocs(dashboard, 'chapter-5-dashboard.png', {
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    });
  });
});
