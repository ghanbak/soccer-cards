---
status: ready
priority: p1
issue_id: "003"
tags: [release, android, google-play, eas]
dependencies: ["001"]
---

# Ship Google Play internal testing build (Android)

Get an AAB onto the Play **internal testing** track (≤100 testers via email, **no review**). Tick each box as you go.

## Problem Statement

The `preview` build is an APK for direct install — Play requires an **AAB** on a testing track, plus the app created in Play Console and the minimum "App content" declarations.

## Prerequisites

- [ ] Google Play Developer account active (https://play.google.com/console).
- [ ] Logged into EAS CLI (`eas whoami` → `ghanbak`).
- [ ] Todo 001 done (production profile verified → AAB).

## Step-by-step

### A. Create the app in Play Console

- [ ] https://play.google.com/console → **All apps** → **Create app**.
- [ ] Fill: **App name** `Book 'Em`; **Default language** English (US); **App or game** = App; **Free or paid** = Free.
- [ ] Tick the **declarations** (Developer Program Policies + US export laws) → **Create app**.

### B. Create the Google service account (Google Cloud Console)

- [ ] https://console.cloud.google.com → create or select a project.
- [ ] **IAM & Admin → Service Accounts → Create service account**: name e.g. `eas-play-publisher` → **Done**.
- [ ] In the service-account list, **copy its email** (e.g. `eas-play-publisher@…iam.gserviceaccount.com`).
- [ ] Open the service account → **Keys → Add key → Create new key → JSON → Create** → download the file.
- [ ] Save it to `./secrets/play-service-account.json` (already gitignored).
- [ ] Enable the API: open https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com → **Enable**.

### C. Grant the service account access in Play Console

- [ ] Play Console → **Users and permissions** → **Invite new users**.
- [ ] Paste the service-account email.
- [ ] Under **App permissions**, add `Book 'Em`; grant **Release to testing tracks** (and **view app information**). (Or set it at Account level.) → **Invite user**.
- [ ] Wait a few minutes for permissions to propagate.

### D. Build the AAB

- [ ] Run `eas build --platform android --profile production` → produces an **AAB**; EAS auto-generates the upload keystore and enrolls **Play App Signing**.

### E. First release — upload manually (one-time Play API limitation)

- [ ] Download the AAB from the EAS build page.
- [ ] Play Console → `Book 'Em` → **Test → Internal testing** → **Create new release**.
- [ ] **Upload** the AAB → accept the **Play App Signing** prompt.
- [ ] Add release notes (e.g. "First internal build") → **Save** → **Review release** → **Start rollout to Internal testing**.
- [ ] (After this first manual upload, future builds can use `eas submit` — step F.)

### F. Subsequent uploads via EAS (optional after first manual release)

- [ ] Confirm `eas.json` `submit.production.android` → `serviceAccountKeyPath: "./secrets/play-service-account.json"`, `track: "internal"`. (Already scaffolded.)
- [ ] Run `eas submit --platform android --profile production` to push later builds to the internal track.

### G. Complete the required "App content" declarations

Play Console → `Book 'Em` → **Policy → App content**. Complete each:

- [ ] **Privacy policy:** paste `https://ghanbak.github.io/soccer-cards/privacy-policy.html`
- [ ] **App access:** all functionality available without login.
- [ ] **Ads:** contains no ads.
- [ ] **Content ratings:** complete the IARC questionnaire.
- [ ] **Target audience and content:** select age groups (not directed at children).
- [ ] **Data safety:** declare **no data collected or shared**.
- [ ] **Government / financial / health:** N/A.

### H. Add testers & verify

- [ ] Internal testing → **Testers** tab → create an email list (or link a Google Group) → add tester emails.
- [ ] Copy the **opt-in URL** and share it with testers.
- [ ] Testers open the link, opt in, and install from the Play Store.
- [ ] Install on a real Android device and confirm splash + toggle + brightness work.

## Acceptance Criteria

- [ ] Play Console app created (`com.ghanbak.bookem`, Free, App).
- [ ] Production AAB built via EAS.
- [ ] Service account created, API enabled, JSON key in `./secrets/`, granted release access in Play Console.
- [ ] AAB on the internal testing track (manual first release; `eas submit` thereafter).
- [ ] All App content forms complete (privacy policy, data safety = none, content rating, target audience, app access, ads).
- [ ] Testers added; app installs and runs on a real Android device.

## Work Log

### 2026-05-28 - Ported from release plan + detailed steps

**By:** Claude Code

**Actions:**
- Added `submit.production.android` (internal track + gitignored key path) to `eas.json`.
- Hosted the zero-data privacy policy for the App-content field.
- Wrote explicit Play Console + Google Cloud walkthrough (grounded on docs.expo.dev/submit/android + the Expo service-account guide).

**Learnings:**
- The **first** Play release must be uploaded manually — the Play API can't create the initial release; `eas submit` works for subsequent uploads.
- Play requires several App-content declarations even for internal testing.

## Notes

Source: release plan §2. Blocked by 001. Console steps + the service-account key need the user's Google login.
