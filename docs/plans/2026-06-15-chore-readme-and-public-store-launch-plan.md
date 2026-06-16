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

## ✅ Decisions (RESOLVED 2026-06-16)

1. **Apple 4.2 "minimum functionality" → Option B: submit the flasher as-is.**
   We'll submit the one-screen flasher to public App Store review without building "The Book" counter first, and **see if it gets rejected**. If 4.2-rejected, fall back to either an appeal or shipping the counter and resubmitting (new build + version). Phase 2 proceeds now; the counter is *not* a prerequisite. **Accepted risk:** a pure red/yellow flasher is a real [4.2 rejection](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality) candidate — budget for at least one rejection→resubmit round.

2. **Google Play account = PERSONAL, created 2026-06-15 → 12-tester closed-testing gate APPLIES.**
   The hard, time-boxed gate is in play (Phase 3). **Researched (2026-06-16):** an *open* beta **cannot** bypass or substitute for this — per [Google](https://support.google.com/googleplay/android-developer/answer/14151465), the qualifying test **must be closed** ("At least 12 testers must be opted-in to your **closed** test when you apply for production access"), and **"open testing is available [only] when you have production access."** So the open beta you wanted is itself locked behind this gate. Forced sequence: **closed test (≥12 testers, 14 continuous days) → apply for production access → granted → open testing + production unlock.**

3. **iPad support → DROP.** Set `ios.supportsTablet: false` in [app.json](../../app.json) (currently `true`). Removes the iPad screenshot set and a class of iPad review nits. **Action item folded into Phase 0.**

4. **Name → bundle id stays `com.ghanbak.bookem`; display name leaning "Book 'Em - World Cup Fan Cards".**
   The **Android package name `com.ghanbak.bookem` is locked and unaffected** by the display name. ⚠️ **Trademark risk on "World Cup":** FIFA aggressively protects the "World Cup" mark; both Apple (Guideline 5.2 — IP) and Google reject app titles/metadata using it without authorization. **Recommend a non-infringing display name** (e.g., "Book 'Em - Soccer Fan Cards", "Book 'Em - Ref Cards") before creating the store records. Final display name still **TBD pending this trademark call.**

---

# Part A — Add a proper README

**Goal:** a single `README.md` at repo root that explains what Book 'Em is, how to run it, and how it's built — useful to future-you, a collaborator, or a hiring reviewer.

**✅ DONE (2026-06-16):** `README.md` is written, committed, and live — it covers the pitch, stack, run instructions (with the Expo-Go-needs-a-dev-client caveat), project layout, Biome/worktree tooling notes, privacy policy, and license. The structure below is kept only as the record of what shipped.

**Detail level: MINIMAL.** This was a content spec, not engineering.

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

### Acceptance criteria — Part A — ✅ all met
- [x] `README.md` at repo root, renders on GitHub.
- [x] Pitch, accurate run instructions + Expo-Go caveat, stack list matching [package.json](../../package.json), Biome/`expo lint` note, privacy + `LICENSE` links.
- [ ] *(Open, unrelated)* `LICENSE` still carries Expo's template copyright — update the holder to your name before public launch.

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
- [ ] Replace the **placeholders** in [eas.json](../../eas.json) `submit.production` (`ascAppId`, `ascApiKeyId`, `ascApiKeyIssuerId`; Android `serviceAccountKeyPath`) with real values. (`ascApiKeyPath` already points at `./secrets/asc-api-key.p8` — leave it.)
- [ ] **Verify secrets are gitignored before the first build** (hard gate): `git check-ignore secrets/asc-api-key.p8 secrets/play-service-account.json` passes, and `git log --all -- secrets/` shows nothing ever committed.
- [ ] **Drop iPad** (Decision #3): set `ios.supportsTablet: false` in [app.json](../../app.json).

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

> **Decision #1 = Option B:** submit the flasher as-is; no counter prerequisite. Proceed, accepting the 4.2 rejection risk.

- [ ] Confirm final **display name** (Decision #4 — avoid "World Cup" trademark) before creating/editing the App Store Connect record.
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
- [ ] App Store listing complete (final display name, copy, 6.9" screenshots, privacy, age rating, pricing).
- [ ] Build submitted for App Review and **Approved** — *or* 4.2-rejected and a resubmit (new auto-incremented build; marketing version bumped only if the prior version already reached "Pending Developer Release"/live) logged.

## Phase 3 — Android public Google Play release

> **⚠️ Decision #2 = gate APPLIES** (personal account, created 2026-06-15). Google requires a **closed test with ≥12 testers opted in for 14 continuous days** before you can apply for production access. **Internal testing does NOT count**, and **open testing can't substitute** (it's only unlocked *after* production access — [confirmed 2026-06-16](https://support.google.com/googleplay/android-developer/answer/14151465)). This is unavoidable calendar time (**~3 weeks** incl. the production-access review); **start it first / in parallel with iOS.**

**The 12-tester closed-testing gate (required):**
- [ ] Build the production **AAB** (`eas build -p android --profile production`) and promote/upload to the **Closed testing** track (not just internal). First upload may need a one-time manual AAB upload to accept Play App Signing — see [todo 003](../../todos/003-ready-p1-ship-android-play-internal.md) §E.
- [ ] Recruit **≥12 testers**; add them to the closed-test email list / Google Group; share the opt-in link; confirm each **opts in**.
- [ ] Keep the closed test running **14 continuous days** with those testers opted in — and **keep the app installed**. The count must stay ≥12 across the trailing 14 days; if anyone uninstalls/opts out and you drop below 12, the window effectively resets. Don't remove testers mid-window.
- [ ] After 14 days, **apply for production access** on the Play Console Dashboard; answer the readiness questionnaire (how you tested, feedback gathered).
- [ ] Wait for Google to **grant production access** — this is a **separate manual review that adds several days** on top of the 14. **Realistic floor: ~3 weeks**, not 2.

**Then (after production access is granted):**
- [ ] Complete the **full public store listing**: copy, ≥2 phone screenshots, **feature graphic 1024×500**, **512² icon**, category.
- [ ] Complete **all** Policy → App content declarations (privacy policy URL, data safety = none, content rating/IARC, target audience, ads = none, app access) — drafted in [todo 003](../../todos/003-ready-p1-ship-android-play-internal.md) §G.
- [ ] Create a **Production** release: upload/promote the AAB, add release notes.
- [ ] Set a **staged rollout %** (e.g., start at 20%) — Play lets you ramp and halt.
- [ ] **Submit for review** → roll out.

### Acceptance criteria — Android
- [ ] Closed test ran ≥14 continuous days with ≥12 opted-in testers; **production access granted** (record the date).
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

## Critical path & residual risks

The hard constraints are all captured in the Decisions and phases above; the only things to keep front-of-mind:

- **Android closed-test gate is the long pole** (Decision #2) — ~3 weeks of uncompressible calendar time. **Start it first, in parallel with iOS.**
- **Apple 4.2** (Decision #1, Option B) — expect a possible rejection; the fallback is appeal *or* ship "The Book" counter and resubmit (a new build + bumped marketing version). We are *not* building the counter pre-emptively.
- **Store policies drift** — re-verify screenshot sizes / Data safety / testing rules against the live consoles at execution time (this plan reflects mid-2026).

## References (verify at execution time)
- Internal-testing foundation: [internal-beta plan](2026-05-28-chore-testflight-play-internal-beta-plan.md) · todos [001](../../todos/001-ready-p2-verify-production-build-config.md)–[005](../../todos/005-pending-p3-external-public-beta-prep.md)
- [EAS Submit — iOS](https://docs.expo.dev/submit/ios/) · [EAS Submit — Android](https://docs.expo.dev/submit/android/) · [App version management](https://docs.expo.dev/build-reference/app-versions/)
- [Apple App Review Guidelines — 4.2 Minimum Functionality](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)
- [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [Google Play — testing requirements for new personal accounts (12 testers / 14 days)](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play internal testing](https://support.google.com/googleplay/android-developer/answer/9845334)
</content>
</invoke>
