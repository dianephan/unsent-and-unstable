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