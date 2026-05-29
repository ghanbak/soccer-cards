---
status: ready
priority: p1
issue_id: "002"
tags: [release, ios, testflight, eas]
dependencies: ["001"]
---

# Ship internal TestFlight build (iOS)

Get a build into internal TestFlight (≤100 team testers, no Beta App Review).

## Problem Statement

The earlier iOS build was ad-hoc internal distribution on the OLD bundle id (`com.ghanbak.soccer-cards`). Internal TestFlight needs an App Store `.ipa` on the new id (`com.ghanbak.bookem`) uploaded to App Store Connect.

## Findings

- Apple Developer Program membership: active ✓.
- New bundle id needs NEW iOS credentials (old cert/profile don't apply).
- `eas.json` `submit.production.ios` is scaffolded with placeholders to fill: `appleId`, `ascAppId`, `appleTeamId`.
- Export compliance already handled (`ITSAppUsesNonExemptEncryption=false`).

## Recommended Action

Create the ASC app record + API key, fill the eas.json iOS placeholders, build with the `production` profile (first run generates credentials), submit to TestFlight, add internal testers.

## Acceptance Criteria

- [ ] App Store Connect app record created (name `Book 'Em`, bundle id `com.ghanbak.bookem`, SKU); name availability resolved.
- [ ] App Store Connect API key (`.p8`) generated for `eas submit`.
- [ ] iOS production credentials created for the new id (`eas build -p ios --profile production`).
- [ ] Production `.ipa` built.
- [ ] `eas.json` `submit.production.ios` placeholders filled (`appleId` / `ascAppId` / `appleTeamId`).
- [ ] `eas submit -p ios --profile production` uploads to TestFlight.
- [ ] TestFlight "Test Information" filled (feedback email + what-to-test).
- [ ] Internal testers added and build assigned.
- [ ] Build installs and runs via TestFlight on a real iPhone.

## Work Log

### 2026-05-28 - Ported from release plan

**By:** Claude Code

**Actions:**
- Added `submit.production.ios` scaffold to `eas.json` (placeholders).

**Learnings:**
- Internal TestFlight skips Beta App Review; external would add review + privacy policy + App Privacy details (see 005).

## Notes

Source: release plan §1. Blocked by 001 (production build config). Console/CLI steps need the user's Apple login — not automatable headlessly.
