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

## Cypress E2E Tests

This project uses the [launchdarkly-cypress-plugin](https://github.com/launchdarkly-labs/launchdarkly-cypress-plugin) to control which Cypress tests run or skip via a LaunchDarkly boolean flag.

### 1. Install Node dependencies

```bash
npm install
```

### 2. Configure your SDK key and flag key

Create a `cypress.env.json` in the project root (gitignored):

```json
{
  "PLUGIN_SDK_KEY": "your-launchdarkly-sdk-key",
  "PLUGIN_FLAG_KEY": "luv-cypress-skip"
}
```

The `luv-cypress-skip` flag is a boolean flag in the `diane-blog` project. When it evaluates to `true` for a given test context, that test is **skipped**.

### 3. Run the tests

Make sure the Flask app is running (`flask run`), then:

```bash
npx cypress run        # headless
npx cypress open       # interactive UI
```

### 4. Control test skipping from LaunchDarkly

In the LaunchDarkly UI, add targeting rules to `luv-cypress-skip` using the `cypress` context kind. Target by:
- **test** attribute: match specific test names (e.g., `Chapter III - The Flaky Invitation`)
- **suite** attribute: match suite names (e.g., `Unsent and Unstable`)