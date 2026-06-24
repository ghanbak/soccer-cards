# Book 'Em 🟨🟥

> A dead-simple referee card flasher. Tap the screen to flash a yellow or red
> card, ref-style — at max brightness so it reads across a room (or a pub).

## What it does

- **One screen, two states, one interaction.** Tap anywhere to toggle yellow ⇄ red.
- Reanimated slide/swap between cards, animated on the UI thread for a smooth 60fps.
- Pins screen brightness to 100% and keeps the screen awake while the app is
  foregrounded; restores both when it goes to the background.
- Medium haptic on every toggle. Portrait only.
- No accounts, no network, no data collection.

## Tech stack

- **Expo SDK 56** (managed) · **React Native 0.85** · **React 19**
- `react-native-reanimated` 4 · `react-native-safe-area-context`
- `expo-brightness` · `expo-haptics` · `expo-keep-awake` · `expo-status-bar` · `expo-splash-screen`
- **TypeScript** · **Biome** (lint/format) · **EAS** (build + submit)

## Getting started

```bash
npm install
npx expo start        # start the dev server (open in a dev client)
npm run ios           # build & run on an iOS simulator/device
npm run android       # build & run on an Android emulator/device
```

> **Heads up:** the native modules (brightness, haptics, keep-awake) don't run in
> plain **Expo Go**. Use a **development build** (`expo-dev-client`) or a real
> `npm run ios` / `npm run android` build to exercise the full app.

## Project layout

| File | Purpose |
|------|---------|
| `App.tsx` | Root scene: card toggle, brightness/keep-awake hooks, splash handoff |
| `CardStack.tsx` | The overlapping card-stack illustration + swap animation |
| `Card.tsx` | A single card |
| `AnimatedSplash.tsx` | JS splash overlay (fly-down) shown over the native splash |
| `colors.ts` | Locked palette — `CARD_YELLOW`, `CARD_RED`, `OUTLINE` |
| `app.json` / `app.config.js` / `eas.json` | Expo app config (version sourced from `package.json`) and EAS build/submit profiles |

## Tooling notes

- Linting/formatting is **Biome**, not ESLint. Don't run `expo lint`.
- Git worktrees each need their own `npm ci` (dependencies aren't shared).

## Building & releasing

EAS profiles live in [`eas.json`](eas.json). Release runbooks are in [`docs/plans/`](docs/plans/).

### Versioning

Two separate numbers, managed in two different places:

- **User-facing version** (`1.0.1`, the store "version train") — sourced from
  `package.json` via [`app.config.js`](app.config.js). Bump it with `npm version`.
- **Build numbers** (iOS `buildNumber` / Android `versionCode`) — auto-incremented
  by EAS on every build (`autoIncrement` in `eas.json`, `appVersionSource: remote`).
  Never set these by hand.

You only ever bump the user-facing version, and only when cutting a release. One
version = one App Store version train: once you've submitted `1.0.1`, the next
release is `1.0.2` (App Store Connect rejects a new build under an already-used
version).

### Cutting a release

```bash
npm version patch          # 1.0.0 → 1.0.1 in package.json, commits + tags v1.0.1
                           # (minor → 1.1.0, major → 2.0.0)
git push --follow-tags     # push the commit and the tag

eas build  --profile production --platform all                  # or ios / android
eas submit --profile production --platform ios   --latest       # → App Store / TestFlight
eas submit --profile production --platform android --latest     # → Play "alpha" (closed) track
```

Notes:

- **iOS, first build of a release must be interactive** (`eas build --platform ios`
  in a terminal, sign in to Apple). The widget extension's App Group
  (`group.com.ghanbak.bookem`) needs Apple-cookies auth to register; the App Store
  Connect API key can't assign App Groups.
- **Android submits to the `alpha` (closed) track** (set in `eas.json`). This feeds
  the personal-account 12-tester / 14-day closed-testing gate and does **not** reset
  its clock — keep ≥12 testers opted in. Requires
  `secrets/play-service-account.json` (gitignored).
- `npm version` needs a clean working tree and does **not** run `postinstall`
  (`patch-package`), so it has no install side effects.

## Privacy

Book 'Em collects nothing and sends nothing.
Policy: <https://ghanbak.github.io/soccer-cards/privacy-policy.html>

## License

MIT — see [`LICENSE`](LICENSE).
