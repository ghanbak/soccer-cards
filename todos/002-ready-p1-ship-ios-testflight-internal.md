---
status: ready
priority: p1
issue_id: "002"
tags: [release, ios, testflight, eas]
dependencies: ["001"]
---

# Ship internal TestFlight build (iOS)

Get a build into internal TestFlight (≤100 team testers, **no Beta App Review**). Tick each box as you go.

## Problem Statement

The earlier iOS build was ad-hoc internal distribution on the OLD bundle id (`com.ghanbak.soccer-cards`). Internal TestFlight needs an App Store `.ipa` on the new id (`com.ghanbak.bookem`) uploaded to App Store Connect.

## Prerequisites

- [ ] Apple Developer Program membership active (sign in at https://developer.apple.com).
- [ ] Logged into EAS CLI (`eas whoami` → `ghanbak`).
- [ ] Todo 001 done (production profile verified).

## Step-by-step

### A. Build + register the bundle id (do this first — it registers the App ID & credentials)

- [ ] Run `eas build --platform ios --profile production`.
- [ ] When prompted, **log in to your Apple account** — EAS will:
  - [ ] register the App ID `com.ghanbak.bookem` in the Apple Developer portal,
  - [ ] generate a **Distribution Certificate** and an **App Store provisioning profile**,
  - [ ] build and produce the `.ipa`.
- [ ] Wait for the build to finish (watch the EAS build page link it prints).

### B. Create the App Store Connect app record

- [ ] Go to https://appstoreconnect.apple.com → **Apps** → click the **＋** → **New App**.
- [ ] Fill the dialog:
  - [ ] **Platforms:** iOS
  - [ ] **Name:** `Book 'Em` (if taken, pick a free display name — the bundle id is independent)
  - [ ] **Primary Language:** English (U.S.)
  - [ ] **Bundle ID:** select `com.ghanbak.bookem` (it appears in the dropdown after step A registered it)
  - [ ] **SKU:** `bookem` (any unique internal string)
  - [ ] **User Access:** Full Access
- [ ] Click **Create**.
- [ ] Open the app → **App Information** (left sidebar, under General) → copy the **Apple ID** number shown under "General Information". **This is your `ascAppId`.**

### C. Create an App Store Connect API key (for `eas submit`)

- [ ] App Store Connect → **Users and Access** → **Integrations** tab → **App Store Connect API** → **Team Keys**.
- [ ] Click **＋ (Generate API Key)**: Name `eas-submit`, **Access:** `App Manager`.
- [ ] **Download** the `.p8` key file (⚠️ one-time download — you can't re-download it).
- [ ] Note the **Key ID** (next to the key) and the **Issuer ID** (shown above the keys table).
- [ ] Save the `.p8` to `./secrets/asc-api-key.p8` (already gitignored).

### D. Fill `eas.json` (`submit.production.ios`)

- [ ] Set `ascAppId` (from step B), `ascApiKeyPath: "./secrets/asc-api-key.p8"`, `ascApiKeyId` (Key ID), `ascApiKeyIssuerId` (Issuer ID). (Scaffold already present — just replace the placeholders.)

### E. Submit to TestFlight

- [ ] Run `eas submit --platform ios --profile production` → uploads the `.ipa` to App Store Connect.
- [ ] In App Store Connect → your app → **TestFlight** tab, wait for the build to leave **"Processing"** (~5–15 min).
- [ ] **Export compliance:** already declared via `ITSAppUsesNonExemptEncryption=false`, so it should auto-clear; if asked, answer that it uses no non-exempt encryption.

### F. Add internal testers & verify

- [ ] TestFlight tab → **Internal Testing** → create a group (or use the default) → **add testers** (they must first exist under **Users and Access** with a role).
- [ ] Assign the processed build to the group.
- [ ] Fill **Test Information** (feedback email + a one-line "what to test").
- [ ] Testers get an email → install via the **TestFlight** app.
- [ ] Install on a real iPhone via TestFlight and confirm splash + toggle + brightness work.

## Acceptance Criteria

- [ ] Production `.ipa` built on `com.ghanbak.bookem` with EAS-generated credentials.
- [ ] App Store Connect app record created; `ascAppId` captured.
- [ ] ASC API key created, `.p8` saved to `./secrets/`, eas.json placeholders filled.
- [ ] `eas submit` upload succeeded; build finished Processing in TestFlight.
- [ ] Internal testers added; build installs and runs via TestFlight on a real iPhone.

## Work Log

### 2026-05-28 - Ported from release plan + detailed steps

**By:** Claude Code

**Actions:**
- Added `submit.production.ios` API-key scaffold to `eas.json`.
- Wrote explicit App Store Connect walkthrough (grounded on docs.expo.dev/submit/ios).

**Learnings:**
- The App ID must be registered before the ASC app record shows the bundle id — so build (step A) before creating the record (step B).
- API-key auth avoids Apple 2FA prompts vs the `appleId`/app-specific-password path.

## Notes

Source: release plan §1. Blocked by 001. Hands-on steps need the user's Apple login — not automatable headlessly. Internal TestFlight skips Beta App Review; external adds review + App Privacy details (see 005).
