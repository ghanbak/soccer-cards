---
status: ready
priority: p2
issue_id: "001"
tags: [release, eas, build]
dependencies: []
---

# Verify production build config & test a release build

Prereq for both store tracks: confirm the EAS `production` profile produces store-ready artifacts and that a real release build runs outside the dev client.

## Problem Statement

Every build so far has been internal-distribution on the old id (ad-hoc `.ipa`, `preview` APK). Store tracks need an App Store `.ipa` and an Android **AAB** from the `production` profile, on the new `com.ghanbak.bookem` id. Before submitting, confirm the profile outputs and that the release build (Hermes, minified, no Metro) actually launches.

## Findings

- `eas.json` `production` profile = `{ "autoIncrement": true }` → iOS defaults to `distribution: store`, Android defaults to **AAB**. The `preview` profile (APK / internal) must NOT be used for stores.
- `appVersionSource: remote` → EAS owns `buildNumber`/`versionCode`; first production build initializes them.
- Marketing version is `1.0.0` in `app.json`.

## Recommended Action

Confirm the production profile outputs, then run one production build per platform on a device to sanity-check the release runtime before wiring submission.

## Acceptance Criteria

- [ ] `production` profile confirmed: iOS `distribution: store`, Android AAB (no `buildType: apk`); `autoIncrement: true`.
- [ ] Marketing version `1.0.0` set; `appVersionSource: remote` confirmed.
- [x] 1024² iOS icon has NO alpha channel (`assets/icon.png` flattened; `hasAlpha: no`).
- [ ] A `production` build launches on a real device (splash + fly-down + toggle work outside the dev client).

## Work Log

### 2026-05-28 - Ported from release plan

**By:** Claude Code

**Actions:**
- Flattened `assets/icon.png` alpha (App Store requirement) — done.
- Confirmed `production` profile defaults; documented version strategy.

**Learnings:**
- Store builds ≠ the dev/preview builds made so far; must use `production`.

## Notes

Source: `docs/plans/2026-05-28-chore-testflight-play-internal-beta-plan.md` §0. Blocks the iOS (002) and Android (003) submission todos.
