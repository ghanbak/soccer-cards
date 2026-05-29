---
title: "Book 'Em — TestFlight (iOS) + Google Play Internal Testing readiness"
type: chore
date: 2026-05-28
---

# Book 'Em — Get to TestFlight + Google Play Internal Testing

Goal: get an installable build into testers' hands on **both** platforms via the **internal** tracks — the fastest path, **no app review** on either store. External/public beta is a deferred section at the bottom.

**Decisions:** Apple Developer account ✓ · Google Play Developer account ✓ · scope = **internal only first**.

**Current state to build on:** Expo SDK 56, app **"Book 'Em"**, id **`com.ghanbak.bookem`** (both platforms), EAS project linked (`@ghanbak/soccer-cards`, projectId `97e1d3…`), `eas.json` has `development` / `preview` / `production` profiles. The earlier iOS build + the `preview` Android APK were **ad-hoc/internal-distribution on the old id** — neither goes to a store track, so both stores need a fresh **`production`** build on the new id.

> Key gotcha baked into these todos: store tracks need **store-distribution** builds — iOS App Store build (not ad-hoc) and an Android **AAB** (not the APK the `preview` profile makes). Our `production` profile already defaults to both; the `preview` profile does not.

---

## 0. Shared prerequisites (do first)

- [ ] **Confirm `production` profile outputs are store-ready** in `eas.json`: iOS `distribution: store` (default) and Android **AAB** (production default — do *not* set `buildType: apk`). Keep `autoIncrement: true` so build numbers bump.
- [ ] **Decide marketing version**: `1.0.0` in `app.json`. With `appVersionSource: remote`, EAS owns `buildNumber`/`versionCode` and auto-increments on each production build.
- [x] **Verify the 1024² iOS icon has NO alpha channel** — done; `assets/icon.png` flattened against `#FFFF00` with ImageMagick (`hasAlpha: no`).
- [ ] **Run a `production` build on a device once** before submitting, to confirm the release build (Hermes, minified, no Metro) launches and the splash/animation work outside the dev client.

---

## 1. iOS → TestFlight (internal)

Internal TestFlight = up to 100 testers on your team, **no Beta App Review**, available as soon as the build finishes processing.

- [ ] **App Store Connect: create the app record** — name `Book 'Em`, bundle id `com.ghanbak.bookem`, primary language, SKU (e.g. `bookem`). Resolve name availability (if `Book 'Em` is taken, pick an alternate *display* name; bundle id is independent).
- [ ] **Generate an App Store Connect API key** (Users and Access → Integrations → App Store Connect API → `.p8`). Preferred over Apple-ID login for `eas submit` (no 2FA prompts).
- [ ] **Create iOS production credentials for the new id**: `eas build --platform ios --profile production` — first run prompts an Apple login and generates the **distribution certificate + App Store provisioning profile** for `com.ghanbak.bookem` (the old id's creds don't apply).
- [ ] **Build**: that same command produces the App Store `.ipa`.
- [ ] **Configure `eas submit`** — add to `eas.json` `submit.production.ios`: `ascAppId`, `appleTeamId`, and the ASC API key (key id / issuer id / path). Then `eas submit --platform ios --profile production` uploads to App Store Connect → TestFlight.
- [ ] **Fill TestFlight "Test Information"**: beta feedback email + a one-line "what to test." Export compliance is already handled (`ITSAppUsesNonExemptEncryption=false`).
- [ ] **Add internal testers** (App Store Connect → Users and Access → add by Apple ID) and assign them to the build. They install via the TestFlight app.
- [ ] **Smoke test on a real iPhone** through TestFlight.

**Pre-wired already:** export-compliance flag, portrait lock, icon, splash.

---

## 2. Android → Google Play Internal Testing

Internal testing track = up to 100 testers via email list, **no review**, live within minutes of upload. Requires an **AAB** and the app created in Play Console.

- [ ] **Play Console: create the app** — name `Book 'Em`, default language, "App" (not game), Free, accept declarations.
- [ ] **Build the AAB**: `eas build --platform android --profile production` (production profile → AAB; EAS auto-generates an upload keystore and enrolls Play App Signing).
- [ ] **Set up `eas submit` for Android**: create a **Google Cloud service account**, grant it access in Play Console (Users & permissions → invite the service-account email with release permissions), download the **JSON key**, save it OUT of git (e.g. `~/.secrets/bookem-play.json`, add to `.gitignore` if kept local), and reference it in `eas.json` `submit.production.android.serviceAccountKeyPath` with `track: "internal"`.
- [ ] **First upload**: `eas submit --platform android --profile production` pushes the AAB to the **internal testing** track. (First-ever upload sometimes must be done manually in Play Console to accept Play App Signing terms — do that once if `eas submit` is blocked.)
- [ ] **Complete the minimum Play "App content" declarations** required to roll out (these gate even internal release in current Play Console):
  - [ ] **Data safety** form → declare **no data collected/shared** (matches the app).
  - [ ] **Content rating** (IARC questionnaire).
  - [ ] **Target audience & content** (not directed at children).
  - [ ] **App access** (all features available without login — true here).
  - [ ] **Ads** declaration → no ads.
  - [ ] **Privacy policy URL** if Play requires it for your declarations (see §3).
- [ ] **Create the Internal testing release**, add tester emails (or a Google Group), share the **opt-in link**, and install on a real Android device.

---

## 3. App-readiness polish (shared)

- [x] **Privacy policy (zero-data)**: done — `privacy-policy.html` hosted via GitHub Pages at **https://ghanbak.github.io/soccer-cards/privacy-policy.html** (use this URL in the Play "App content" privacy-policy field).
- [ ] **App Store category / Play category**: pick (e.g., **Sports** or **Entertainment**).
- [ ] **Minimal screenshots** for the listings: capture from the iOS simulator (we already have splash + yellow + red states in `.context/splash-capture/`). iOS needs at least one 6.7"/6.9" set; Play needs ≥2 phone screenshots. (Strictly required for *closed/open* and store listing; internal can often go without — capture anyway, it's quick.)
- [ ] **Listing copy**: app name, subtitle/short description, full description. Keep it short — it's a one-tap referee card flasher.

---

## 4. Deferred — going external/public later (not needed for internal)

- [ ] iOS **external** TestFlight: requires **Beta App Review** + privacy policy + complete App Privacy ("Data Not Collected") details; public TestFlight link.
- [ ] Play **closed/open** testing: full store listing (icon 512², feature graphic 1024×500, screenshots), then graduate the track.
- [ ] **Apple 4.2 "minimum functionality" risk** for the eventual **full App Store release**: a pure red/yellow flasher is in the rejection blast radius. Plan to ship the **"The Book" card counter** (v1.1, already on the roadmap) before/with public review to clear the bar. Internal TestFlight is **not** affected by this.

---

## Risks / notes

- **Store builds ≠ the builds we've made so far.** Don't try to push the `preview` APK / ad-hoc `.ipa` to a store track — use `production` (App Store `.ipa` + Android AAB).
- **New bundle id needs new iOS credentials** — the old id's cert/profile won't work; the first `production` iOS build regenerates them.
- **First Play upload** may need a one-time manual AAB upload in the console to accept Play App Signing before `eas submit` works.
- **Secrets**: the Play service-account JSON and the ASC API `.p8` must never be committed.
- **`eas submit` config** lives in `eas.json` (`submit.production`) — the only code/config change in this whole plan; everything else is console/CLI work.

## References (verify at execution time)

- [EAS Submit — iOS](https://docs.expo.dev/submit/ios/) · [EAS Submit — Android](https://docs.expo.dev/submit/android/)
- [Internal distribution vs store](https://docs.expo.dev/build/internal-distribution/) · [App version management](https://docs.expo.dev/build-reference/app-versions/)
- [TestFlight internal testing](https://developer.apple.com/help/app-store-connect/test-a-beta-version/) · [Play internal testing](https://support.google.com/googleplay/android-developer/answer/9845334)
