---
status: ready
priority: p1
issue_id: "003"
tags: [release, android, google-play, eas]
dependencies: ["001"]
---

# Ship Google Play internal testing build (Android)

Get an AAB onto the Play internal testing track (≤100 testers via email, no review).

## Problem Statement

The `preview` build is an APK for direct install — Play requires an **AAB** uploaded to a testing track, plus the app created in Play Console and the minimum "App content" declarations completed.

## Findings

- Google Play Developer account: set up ✓.
- `production` profile → AAB; EAS auto-generates an upload keystore + enrolls Play App Signing.
- `eas.json` `submit.production.android` scaffolded: `track: internal`, `serviceAccountKeyPath: ./secrets/play-service-account.json` (gitignored).
- Privacy policy live: https://ghanbak.github.io/soccer-cards/privacy-policy.html (use in App content).
- First-ever upload sometimes must be done manually in Play Console to accept Play App Signing before `eas submit` works.

## Recommended Action

Create the Play app, build the AAB, set up the service-account key, submit to the internal track, and complete the App-content forms (data safety = none, etc.).

## Acceptance Criteria

- [ ] Play Console app created (name `Book 'Em`, package `com.ghanbak.bookem`, Free, App not Game).
- [ ] Production AAB built (`eas build -p android --profile production`).
- [ ] Google Cloud service account created, granted Play Console release access, JSON key saved to `./secrets/play-service-account.json`.
- [ ] AAB uploaded to the **internal testing** track (`eas submit -p android --profile production`; first upload manually if Play App Signing terms block it).
- [ ] App content forms complete: Data safety (no data), Content rating (IARC), Target audience (not children), App access (no login), Ads (none), Privacy policy URL.
- [ ] Internal testing release created; tester emails / opt-in link shared.
- [ ] App installs and runs on a real Android device.

## Work Log

### 2026-05-28 - Ported from release plan

**By:** Claude Code

**Actions:**
- Added `submit.production.android` to `eas.json` (internal track + gitignored key path).
- Hosted the zero-data privacy policy for the Play privacy-policy field.

**Learnings:**
- Play requires AAB (not the preview APK) and several content declarations even for internal testing.

## Notes

Source: release plan §2. Blocked by 001. Console steps + the service-account key need the user's Google login.
