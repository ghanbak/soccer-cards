---
title: "Book 'Em — Add a README + Public App Store & Google Play launch"
type: chore
date: 2026-06-15
---

# Book 'Em — README + Public Store Launch 📚🚀

Two independently-actionable deliverables bundled as "make Book 'Em launch-ready":

- **Part A — A proper README** (net new; the repo has none).
- **Part B — The full *public* App Store + Google Play launch runbook** (net new; everything we have so far targets *internal* testing only).

> **Scope boundary.** The existing release docs ([internal-beta plan](2026-05-28-chore-testflight-play-internal-beta-plan.md), todos [001](../../todos/001-ready-p2-verify-production-build-config.md)–[005](../../todos/005-pending-p3-external-public-beta-prep.md)) get a build into testers' hands with **no store review**. This plan picks up where those stop and covers going **public** on both stores — which triggers review, full listings, and (on Android) a hard testing gate. Where a step is already documented, this plan **references** it rather than repeating it.

---

## Current state (grounded in the repo)

- App: **"Book 'Em"** — a one-screen referee card flasher (tap to toggle yellow ⇄ red; max brightness + keep-awake + haptics while foregrounded). One screen, two states, one interaction. See [App.tsx](../../App.tsx).
- Stack: Expo **SDK 56** (`~56.0.6`), React Native `0.85.3`, Reanimated `4.3.1`. See [package.json](../../package.json).
- Identity: name **Book 'Em**, bundle id **`com.ghanbak.bookem`** (both platforms), EAS project `97e1d378…`, owner `ghanbak`. See [app.json](../../app.json).
- Build/submit config: [eas.json](../../eas.json) has `production` (iOS store `.ipa` + Android AAB, `autoIncrement`) and scaffolded `submit.production` blocks (iOS API-key + Android service-account) — **placeholders still need real values**.
- Done already: zero-data privacy policy hosted at **https://ghanbak.github.io/soccer-cards/privacy-policy.html**; iOS 1024² icon flattened (no alpha); candidate screenshots staged in `.context/splash-capture/`.

---

## ⚠️ Decisions to make before doing the work

These are forks in the plan. Resolve them first — they change what the steps even are.

1. **Apple 4.2 "minimum functionality" — do we ship the counter first?**
   A pure red/yellow flasher is squarely in Apple's [4.2 rejection blast radius](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality) for a *public* App Store release. (Internal/external TestFlight is not affected; **public review is**.) The roadmap mitigation is **"The Book" card counter (v1.1)** — real, retained functionality.
   - **Option A (recommended):** ship "The Book" counter *before* public iOS review. Materially lowers rejection risk. Cost: build the feature first.
   - **Option B:** submit the flasher as-is and absorb likely rejection + appeal/iterate. Faster to *attempt*, slower if rejected.
   - This decision gates **Phase 2 (iOS)**. Android has no equivalent functionality bar, so Phase 3 can proceed regardless.

2. **Is the Google Play account *personal* or *organization*?** (Verify in Play Console → account details.)
   - **Personal account created on/after 2023-11-13** → the **12-testers / 14-day closed-testing gate** applies (Phase 3). This is a *hard, time-boxed* blocker — plan ~2+ weeks of calendar time.
   - **Organization account** → exempt; you can go straight from build to production access.

3. **iPad support — keep or drop?** `app.json` sets `ios.supportsTablet: true`. Public App Store review will expect **iPad screenshots** and an iPad-correct layout.
   - **Recommended:** set `supportsTablet: false` for v1 (the app is portrait-phone-shaped). Removes an entire screenshot set + a class of review nits. Flip back on later if desired.

4. **App name lock-in.** Confirm **"Book 'Em"** is available as the *display name* on both stores (the bundle id is independent and already chosen). Have a fallback display name ready.

Use the **AskUserQuestion**-style resolution at execution time; the rest of the plan assumes **A + (verify account type) + drop iPad** unless you decide otherwise.

---

# Part A — Add a proper README

**Goal:** a single `README.md` at repo root that explains what Book 'Em is, how to run it, and how it's built — useful to future-you, a collaborator, or a hiring reviewer.

**Detail level: MINIMAL.** This is a content spec, not engineering.

### Proposed `README.md` structure

```markdown
# Book 'Em 🟨🟥

> A dead-simple referee card flasher. Tap the screen to flash a yellow or red
> card, ref-style — at max brightness so it reads across a room (or a pub).

<!-- optional: side-by-side yellow/red screenshot from .context/splash-capture/ -->

## What it does
- One screen, two states (yellow / red), one interaction: tap anywhere to toggle.
- Reanimated slide/swap between cards on the UI thread.
- Pins screen brightness to 100% and keeps the screen awake while foregrounded;
  restores both on background.
- Medium haptic on every toggle. Portrait only. No accounts, no data, no network.

## Tech stack
- Expo SDK 56 (managed) · React Native 0.85 · React 19
- react-native-reanimated 4 · expo-brightness / -haptics / -keep-awake / -status-bar
- TypeScript · Biome (lint/format) · EAS (build + submit)

## Getting started
```bash
npm install
npx expo start           # dev server (scan QR with Expo Go / dev client)
npm run ios              # build & run on iOS simulator/device
npm run android          # build & run on Android emulator/device
```
> Native modules (brightness/haptics) need a **dev client** or a real build —
> they won't run in plain Expo Go. See expo-dev-client.

## Project layout
| File | Purpose |
|------|---------|
| `App.tsx` | Root: scene, brightness/keep-awake hooks, splash handoff |
| `CardStack.tsx` / `Card.tsx` | The card-stack illustration + animation |
| `AnimatedSplash.tsx` | JS splash overlay (fly-down) |
| `colors.ts` | `CARD_YELLOW` / `CARD_RED` |

## Building & releasing
EAS profiles live in `eas.json`. See `docs/plans/` for the release runbooks.
```bash
eas build --profile production --platform ios|android
eas submit --profile production --platform ios|android
```

## Privacy
Collects nothing, sends nothing. Policy: <privacy-policy URL>.

## License
See `LICENSE`.
```

### Acceptance criteria — Part A
- [ ] `README.md` exists at repo root, renders cleanly on GitHub.
- [ ] One-line description + the "one screen, two states" pitch.
- [ ] Accurate run instructions (`npm install`, `expo start`, `npm run ios/android`) **and** the Expo-Go-won't-work-for-native-modules caveat.
- [ ] Stack list matches [package.json](../../package.json) (SDK 56, RN 0.85, Reanimated 4) — no version drift.
- [ ] Mentions Biome (not ESLint) and that `expo lint` is not used (matches project tooling convention).
- [ ] Links the privacy policy and `LICENSE`.
- [ ] (Optional) embeds a yellow/red screenshot.

---

# Part B — Public App Store & Google Play launch

**Detail level: A LOT** — phased, because this is multi-week, multi-console, and has hard gates.

```
Phase 0  Foundations (mostly already done — internal testing path)
Phase 1  Shared public-listing assets (copy, screenshots, graphics)
Phase 2  iOS → public App Store (review)         ── gated by 4.2 decision
Phase 3  Android → public Google Play            ── gated by 12-tester rule
Phase 4  Submit, monitor, staged rollout, post-launch
```

## Phase 0 — Foundations (prerequisite, largely done)

Reuse the existing work; don't redo it. Public launch *requires* a working production build + submission pipeline first.

- [ ] Production build config verified — see [todo 001](../../todos/001-ready-p2-verify-production-build-config.md).
- [ ] iOS submission pipeline (ASC app record, API key, `eas submit`) — see [todo 002](../../todos/002-ready-p1-ship-ios-testflight-internal.md). **Public launch reuses the same app record & key.**
- [ ] Android submission pipeline (Play app, service account, AAB) — see [todo 003](../../todos/003-ready-p1-ship-android-play-internal.md).
- [ ] Replace the **placeholders** in [eas.json](../../eas.json) `submit.production` (`ascAppId`, `ascApiKeyId`, `ascApiKeyIssuerId`; Android `serviceAccountKeyPath`) with real values. Secrets stay out of git (`./secrets/`).
- [ ] Apply the **decisions** above to config: if dropping iPad, set `ios.supportsTablet: false` in `app.json`.

## Phase 1 — Shared listing assets

Builds on [todo 004](../../todos/004-ready-p2-store-listing-and-screenshots.md) (privacy policy ✓, partial screenshots). Public listings need the *complete* set.

- [ ] **Listing copy** (write once, adapt per store): app name, subtitle/short description (≤30 / ≤80 chars), full description, keywords (iOS), promotional text. Keep it tight — it's a one-tap flasher.
- [ ] **Categories**: pick primary/secondary (e.g., **Sports** or **Entertainment**) for both stores.
- [ ] **iOS screenshots**: **one 6.9" set is now sufficient** (1320×2868 px, PNG/JPEG, RGB, **no alpha**, exact dimensions) — Apple auto-scales to smaller iPhones. Capture clean **yellow + red** states (the red state needs a tap — can't be captured programmatically). *Only add an iPad set if `supportsTablet` stays `true`.*
- [ ] **Play screenshots**: ≥2 phone screenshots (yellow + red).
- [ ] **Play feature graphic**: **1024×500** (required for the public store listing — not needed for internal).
- [ ] **Play store icon**: **512×512** PNG.
- [ ] **Privacy nutrition labels** (both stores, declare **no data collected**):
  - iOS **App Privacy** → "Data Not Collected".
  - Play **Data safety** → no data collected/shared (already drafted in [todo 003](../../todos/003-ready-p1-ship-android-play-internal.md) §G).

## Phase 2 — iOS public App Store release

> **Gated by Decision #1.** If shipping "The Book" counter first, build it before this phase.

- [ ] **Resolve App Review risk (4.2)** per Decision #1 (counter shipped, or accept rejection risk).
- [ ] Bump **marketing version** if needed in `app.json` (`appVersionSource: remote` means EAS owns build number; the *marketing* version `1.0.0` is yours to set).
- [ ] **Build + submit** a `production` build (same pipeline as TestFlight): `eas build -p ios --profile production` → `eas submit -p ios --profile production`. The public release uses the **same processed build** you can also TestFlight first.
- [ ] In **App Store Connect → your app → [version] → "Prepare for Submission"**:
  - [ ] Attach the build, screenshots (Phase 1), description/keywords/subtitle, support URL, marketing URL (optional), **privacy policy URL**.
  - [ ] **App Privacy** = Data Not Collected.
  - [ ] **Age rating** questionnaire.
  - [ ] **Export compliance**: already pre-declared via `ITSAppUsesNonExemptEncryption=false` in [app.json](../../app.json).
  - [ ] **Pricing**: Free.
  - [ ] **Release option**: choose **manual release** (recommended for a first launch) or **phased release** (auto 7-day ramp).
- [ ] **Submit for Review.** First-time review typically ~24–48h.
- [ ] **Handle the outcome**: if rejected (watch for 4.2), respond in Resolution Center / appeal, or ship the counter and resubmit (a new build + version).

### Acceptance criteria — iOS
- [ ] App Store listing complete (copy, 6.9" screenshots, privacy, age rating, pricing).
- [ ] 4.2 decision executed and recorded.
- [ ] Build submitted for App Review; **Approved**; live (or ready to manually release).

## Phase 3 — Android public Google Play release

> **⚠️ Gated by Decision #2 — the closed-testing gate.** For **personal accounts created on/after 2023-11-13**, Google requires a **closed test with ≥12 testers opted in for 14 continuous days** *before* you can apply for production access. **Internal testing does NOT count** — it must be the **Closed** track. Org accounts are exempt.

**If the 12-tester gate applies (personal account):**
- [ ] Build the production **AAB** (`eas build -p android --profile production`) and promote/upload to the **Closed testing** track (not just internal). First upload may need a one-time manual AAB upload to accept Play App Signing — see [todo 003](../../todos/003-ready-p1-ship-android-play-internal.md) §E.
- [ ] Recruit **≥12 testers**; add them to the closed-test email list / Google Group; share the opt-in link; confirm each **opts in**.
- [ ] Keep the closed test running **14 continuous days** with those testers opted in. (Don't remove testers mid-window.)
- [ ] After 14 days, **apply for production access** on the Play Console Dashboard; answer the readiness questionnaire (how you tested, feedback gathered).
- [ ] Wait for Google to **grant production access**.

**Then (all personal + org accounts):**
- [ ] Complete the **full public store listing**: copy, ≥2 phone screenshots, **feature graphic 1024×500**, **512² icon**, category.
- [ ] Complete **all** Policy → App content declarations (privacy policy URL, data safety = none, content rating/IARC, target audience, ads = none, app access) — drafted in [todo 003](../../todos/003-ready-p1-ship-android-play-internal.md) §G.
- [ ] Create a **Production** release: upload/promote the AAB, add release notes.
- [ ] Set a **staged rollout %** (e.g., start at 20%) — Play lets you ramp and halt.
- [ ] **Submit for review** → roll out.

### Acceptance criteria — Android
- [ ] Account type verified; 12-tester gate satisfied **if** applicable (≥12 testers, 14-day window, production access granted).
- [ ] Full public listing complete (copy, screenshots, feature graphic, 512² icon).
- [ ] All App content declarations complete.
- [ ] Production release reviewed and rolling out.

## Phase 4 — Submit, monitor & post-launch

- [ ] **Monitor reviews** on both stores (App Review status / Play review).
- [ ] **Staged rollout watch** (Android): check crash/ANR rates in Play vitals before ramping to 100%; halt rollout if vitals spike.
- [ ] **iOS phased release watch** (if chosen): monitor before full availability.
- [ ] **Crash visibility**: decide whether v1 ships with any crash reporting (currently none — acceptable for a one-screen app, but note the blind spot).
- [ ] **Tag the release** in git and record the live store URLs back into this plan / README.
- [ ] **Update todo 005** to "done/superseded" once public launch lands.

---

## SpecFlow notes — edge cases baked in

- **Account-type branch** (personal vs org) changes Android from ~1 day to ~2+ weeks. Verify *first*.
- **4.2 fork** changes whether iOS needs a feature build before submission.
- **iPad screenshots** only required if `supportsTablet` stays true — flipping it removes work and review surface.
- **Rejection loop**: an App Store rejection needs a *new build + new version* to resubmit; budget for at least one round.
- **Secrets/2FA**: console steps need the owner's Apple/Google logins and are not headlessly automatable; the ASC `.p8` and Play service-account JSON must never be committed.
- **First Play upload** quirk (manual AAB to accept Play App Signing) applies on the closed track too.
- **Name/trademark**: "Book 'Em" availability is store-checked at app-record creation; have a fallback display name.

## Risks
- **Google 12-tester / 14-day gate is the critical-path blocker** for Android public launch on a personal account — it's calendar time you can't compress. Start it early, in parallel with iOS.
- **Apple 4.2** is the critical-path risk for iOS — mitigate by shipping the counter.
- Store **policies change**; re-verify screenshot sizes / Data safety / testing rules against the live consoles at execution time (this plan reflects mid-2026).

## References (verify at execution time)
- Internal-testing foundation: [internal-beta plan](2026-05-28-chore-testflight-play-internal-beta-plan.md) · todos [001](../../todos/001-ready-p2-verify-production-build-config.md)–[005](../../todos/005-pending-p3-external-public-beta-prep.md)
- [EAS Submit — iOS](https://docs.expo.dev/submit/ios/) · [EAS Submit — Android](https://docs.expo.dev/submit/android/) · [App version management](https://docs.expo.dev/build-reference/app-versions/)
- [Apple App Review Guidelines — 4.2 Minimum Functionality](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)
- [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [Google Play — testing requirements for new personal accounts (12 testers / 14 days)](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play internal testing](https://support.google.com/googleplay/android-developer/answer/9845334)
</content>
</invoke>
