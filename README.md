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
| `app.json` / `eas.json` | Expo app config and EAS build/submit profiles |

## Tooling notes

- Linting/formatting is **Biome**, not ESLint. Don't run `expo lint`.
- Git worktrees each need their own `npm ci` (dependencies aren't shared).

## Building & releasing

EAS profiles live in [`eas.json`](eas.json). Release runbooks are in [`docs/plans/`](docs/plans/).

```bash
eas build  --profile production --platform ios   # or android
eas submit --profile production --platform ios   # or android
```

## Privacy

Book 'Em collects nothing and sends nothing.
Policy: <https://ghanbak.github.io/soccer-cards/privacy-policy.html>

## License

MIT — see [`LICENSE`](LICENSE).
