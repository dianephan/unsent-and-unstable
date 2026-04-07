# Unsent and Unstable

A demo web app that tells a love story between feature flags and test automation, inspired by love for romcoms. Letters, proposals, and invitations are controlled by LaunchDarkly feature flags — toggling them dramatizes real engineering pain: flaky tests, missing flag coverage, and chaotic staging environments, all through Regency-era emotional damage.

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Get your LaunchDarkly SDK key

This app uses flags in the **diane-blog** project. Grab the **production** environment SDK key from:

**LaunchDarkly > diane-blog > Settings > Environments > Production > SDK Key**

### 3. Run the app

```bash
flask run
```

## Playwright Screenshot Tests

This branch uses [Playwright](https://playwright.dev/) with a screenshot utility adapted from [ld-docs-private](https://github.com/launchdarkly/ld-docs-private) to capture and diff screenshots of the app UI. When you make UI changes, screenshots that differ from the baseline are automatically updated — only changed screenshots get saved.

### 1. Install Node dependencies

```bash
npm install
```

### 2. Install Playwright browsers (first time only)

```bash
npx playwright install chromium
```

### 3. Run the screenshot tests

Make sure Flask is running in another terminal (`flask run`), then:

```bash
npx playwright test
```

This runs 6 tests (full page + one per chapter). Each test:
- Visits the app
- Asserts the chapter content exists
- Takes a screenshot and compares it pixel-by-pixel against the existing baseline in `playwright/screenshots/`
- Only saves the screenshot if it differs by more than 0.1%

### 4. Force-update all screenshots

To regenerate all screenshots regardless of whether they changed:

```bash
ALWAYS_SAVE=1 npx playwright test
# or
npm run screenshots
```

### 5. Workflow for UI changes

```bash
# 1. Make your UI change (edit CSS, HTML, toggle a flag, etc.)

# 2. Run the tests — only changed screenshots get saved
npx playwright test

# 3. Check which screenshots changed
git status

# 4. Commit the updated screenshots with your code
git add playwright/screenshots/ <your-changed-files>
git commit -m "Update UI and screenshots"

# 5. Push and open a PR — reviewers see exactly which screenshots changed
git push
```

### How the screenshot diff works

The `playwright/screenshot-utils.js` utility (adapted from `takeScreenshotForDocs` in ld-docs-private) uses `pngjs` and `pixelmatch` for pixel-level comparison:

- **First run:** No baseline exists, so all screenshots are saved
- **Subsequent runs:** Each new screenshot is compared against the existing file. Only overwritten if >0.1% of pixels differ
- **Metadata:** `playwright/screenshot-metadata.json` (gitignored) tracks what changed per run — whether each file was saved, % difference, and whether image sizes changed
- **Highlights:** The utility supports optional red-border highlights around specific elements via the `highlight` option

### Files

```
playwright/
├── unsent-and-unstable.spec.js   # 6 test specs (full page + chapters I-V)
├── screenshot-utils.js           # Screenshot capture + pixel diff utility
└── screenshots/                  # Baseline PNGs (committed to git)
    ├── full-page.png
    ├── chapter-1-letter.png
    ├── chapter-2-proposal.png
    ├── chapter-3-invitation.png
    ├── chapter-4-staging.png
    └── chapter-5-dashboard.png
playwright.config.js              # Playwright config (Chromium, 1280x900)
```

### npm scripts

| Command | What it does |
|---|---|
| `npm test` | Run Playwright tests (only save changed screenshots) |
| `npm run screenshots` | Force-save all screenshots regardless of diff |