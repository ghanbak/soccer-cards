---
title: Soccer Cards — Red/Yellow Referee App (React Native)
type: feat
date: 2026-05-28
brainstorm: docs/brainstorms/2026-05-27-soccer-cards-brainstorm.md
---

# Soccer Cards — Red/Yellow Referee App (React Native)

## Overview

A one-screen Expo app for soccer fans to flash a yellow or red card. The full-screen background fills with the active card's color; a small card-stack at the bottom shows which card is on top. Tapping the card-stack (only) toggles state: the cards do a slide-and-stack swap while the background cross-fades over 120ms. The phone runs at max brightness while foregrounded so the card reads across a room.

**Stack:** Expo (managed) + React Native + Reanimated 3.

This is one screen, two states, one interaction. The file tree, phases, and acceptance criteria are kept deliberately small — the only real engineering here is the motion.

Plan-time refinements over the brainstorm:
1. The full-screen color **cross-fades** (it does not slide). The slide-and-stack animation applies **only to the bottom card-stack**.
2. Background fade: **120ms, `cubic-bezier(0.4, 0.0, 0.2, 1.0)`** (material standard easing).
3. The tap target **hugs the card-stack** — a `Pressable` around just the cards. Tapping the background does nothing.

## Architecture

Three source files. No `src/` tree, no theme module, no navigation, no state library.

```
soccer-cards/
├── app.json            # portrait lock, status bar style, app meta
├── babel.config.js     # 'react-native-reanimated/plugin' MUST be last
├── App.tsx             # everything: background, card-stack, tap, brightness, keep-awake, status bar, constants
├── Card.tsx            # one card's visual (rounded rect, dark outline, shadow)
└── colors.ts           # CARD_YELLOW, CARD_RED, OUTLINE
```

`App.tsx` holds the background `View` (one `useAnimatedStyle`), the card-stack `Pressable`, the toggle handler, the brightness `useEffect`, `useKeepAwake()`, the status bar, and the motion constants. If a second screen ever appears, extract then — not before.

### State & animated values

- `card: 'yellow' | 'red'` — JS state, initial `'yellow'`.
- `colorProgress` — shared value local to the background. `withTiming(target, { duration: 120, easing: Easing.bezier(0.4, 0, 0.2, 1) })`; feeds `interpolateColor([CARD_YELLOW, CARD_RED])`. Driven by a `useEffect` on `card`. No imperative API.
- `swapProgress` — shared value for the stack. `0 = initial stack order, 1 = swapped` (deliberately decoupled from color — the cards don't care which color is on top). `withSpring(target, SPRING)`.

Two independent values is the right call: the background (120ms timing) and the cards (spring) have intentionally different durations and easings. Mapping both off one value would be cleverness for its own sake.

### Card-swap motion

Each `Card` holds `frontPose` and `backPose` (`rotate`, `translateX`, `translateY`) and interpolates its transform from `swapProgress`. On toggle both cards animate to the opposite pose. A brief `translateY ↑ 8px` arc mid-swap adds a "lift." `zIndex` swaps at `swapProgress === 0.5` (via `useAnimatedReaction`) so the rising card sits on top through the second half.

### Tap handler

1. `Haptics.impactAsync(Medium)` — fire-and-forget.
2. Flip `card`.
3. If `useReducedMotion()` (from Reanimated): set both shared values to target instantly. Else animate (`withTiming` / `withSpring`).

Rapid taps re-target the shared values cleanly — no special handling.

### Brightness (the one piece with real lifecycle bugs)

In `App.tsx`, a `useEffect` with an `AppState` listener and a captured-original ref:

```tsx
const original = useRef<number | null>(null);
useEffect(() => {
  const pin = async () => {
    if (original.current == null) original.current = await Brightness.getBrightnessAsync();
    await Brightness.setBrightnessAsync(1);
  };
  const restore = async () => {
    if (original.current != null) await Brightness.setBrightnessAsync(original.current);
  };
  pin();
  const sub = AppState.addEventListener('change', s => (s === 'active' ? pin() : restore()));
  return () => { sub.remove(); restore(); };
}, []);
```

The `original.current == null` guard prevents re-capturing 1.0 after a background→foreground→background cycle (the bug that makes brightness "stick" bright). `expo-brightness` is window-scoped on both platforms — no `WRITE_SETTINGS` prompt. iOS Low Power Mode may cap brightness; best-effort, no UI in v1.

### Status bar & keep-awake

- `useKeepAwake()` in `App.tsx`.
- `<StatusBar style="dark" />`. **SDK 56 is edge-to-edge by default and `expo-status-bar` dropped the `backgroundColor` prop** — the root view draws *behind* the status bar, so the card color (and its 120ms fade) shows through automatically. Dark icons read on both bright colors.

## Implementation Status (2026-05-28)

**Code complete.** Verified via build tooling: `tsc --noEmit` clean, iOS **and** Android Metro bundles succeed (939 modules), `expo-doctor` 21/21 checks pass. Built on **Expo SDK 56 / RN 0.85 / React 19.2 / Reanimated 4.3** (newer than the plan's original "Reanimated 3" assumption — see the SDK-56 deltas noted below).

**Still requires an on-device run** (cannot be done headlessly): the *feel* of the animation, that the haptic actually fires on hardware, brightness pin/restore across real background cycles, and that the label reads under VoiceOver/TalkBack. Criteria below are checked as **implemented to spec**; the device-only verifications are called out.

### SDK 56 deltas discovered during the build (plan was written against older assumptions)
- **Reanimated 4** (not 3): babel plugin is now **`react-native-worklets/plugin`**, not `react-native-reanimated/plugin`. Requires the New Architecture (default on in RN 0.85). All used APIs (`useSharedValue`, `useAnimatedStyle`, `interpolateColor`, `withTiming`, `withSpring`, `useReducedMotion`) unchanged.
- **`expo-status-bar`** dropped `backgroundColor`; edge-to-edge handles the color behind the bar.
- **`babel-preset-expo`** had to be added as an explicit top-level devDependency (npm nested it under `expo/`, breaking babel resolution).

## Acceptance Criteria

- [x] App always boots to the **yellow** card.
- [x] Tapping the card-stack toggles yellow ↔ red; tapping the background does nothing (the `Pressable` hugs the 240×250 stack only).
- [x] Each toggle fires `Haptics.ImpactFeedbackStyle.Medium`. *(implemented; hardware fire pending device)*
- [x] Background fades between yellow and red over **120ms** with `cubic-bezier(0.4, 0, 0.2, 1)`.
- [x] Cards swap: front → back pose and back → front pose, with a lift arc and a z-index swap at the midpoint.
- [x] Brightness pinned to 100% while foregrounded; **original brightness restored on background and on unmount**, with a capture-once guard against re-capturing 1.0 across cycles. *(implemented; cross-cycle behavior pending device)*
- [x] Screen stays awake while foregrounded (`useKeepAwake`).
- [x] Status bar visible, color shows through (edge-to-edge), dark icons.
- [x] Portrait locked (`app.json`).
- [x] Reduce-motion on: state snaps with no animation; haptic still fires (`useReducedMotion` branch).
- [x] Accessibility label on the card-stack flips with state ("Yellow card. Tap to show red card." ↔ red). *(VoiceOver/TalkBack read-out pending device)*

Remaining verification is one physical run per platform plus the reduce-motion + VoiceOver/TalkBack checks. No instrumented perf targets — if the swap feels janky on a device, tune `SWAP_SPRING`; that's a feel call, not a metric.

## Implementation Phases

### Phase 1 — Bootstrap + system behavior
- `npx create-expo-app -t expo-template-blank-typescript`; `npx expo install react-native-reanimated react-native-safe-area-context expo-brightness expo-keep-awake expo-haptics expo-status-bar`.
- `babel.config.js`: Reanimated plugin **last**. `app.json`: portrait lock, dark status bar.
- Wire `useKeepAwake()`, the brightness `useEffect`, and `<StatusBar>` in `App.tsx` up front (4 lines + the brightness hook).
- **Done when:** blank app boots on both simulators, dims up to full brightness, never sleeps.

### Phase 2 — Scene + interaction
- `colors.ts`; `Card.tsx` (rounded rect, ~3px outline, soft shadow).
- Lay out two cards in fanned poses in `App.tsx`; wrap them in a `Pressable` that hugs the cards, with an `accessibilityRole="button"` + dynamic label.
- On tap: flip `card`, **snap** poses + background + fire haptic (no animation yet).
- **Done when:** at rest it matches the yellow-card mock; tapping the cards snaps between states with haptics; tapping the background does nothing.

### Phase 3 — Animations
- Motion constants at the top of `App.tsx`: `BG_FADE_MS = 120`, `BG_EASING`, `SPRING`, poses.
- `colorProgress` + `interpolateColor` for the background; `swapProgress` + per-card transform interpolation; z-swap at 0.5 via `useAnimatedReaction`.
- Branch the tap handler on `useReducedMotion()`.
- **Done when:** tap animates the card swap (~300–400ms) while the background fades over 120ms; both feel crisp and independent.

### Phase 4 — Polish + build
- Reduce-motion + VoiceOver/TalkBack verification. Placeholder icon + splash.
- `eas.json` with `development` + `preview` profiles; install preview builds on one iOS and one Android device.
- **Done when:** preview builds run on both platforms with all acceptance criteria green.

## Notes / Risks

- **Reanimated babel plugin must be the last entry in `babel.config.js`** — the #1 silent-breakage cause. Verify at first build.
- **iOS Low Power Mode caps brightness** — known limitation, no v1 UI.

## Open Questions

- **App name + bundle id** — pick before the first EAS build (working names: "Ref Cards", "Card!", "Whistle").
- **Card hex values** — `colors.ts` values are eyeballed against the mock at implementation time.
- **Spring vs. timing for the swap** — start with spring; if imprecise, fall back to `withTiming(350, Easing.out(Easing.cubic))`.

## References

- Brainstorm: `docs/brainstorms/2026-05-27-soccer-cards-brainstorm.md`
- Design mock: `.context/attachments/6xdKUt/image.png`
- Consult at build time (versions drift): [Expo SDK](https://docs.expo.dev/versions/latest/) · [expo-brightness](https://docs.expo.dev/versions/latest/sdk/brightness/) · [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) · [Reanimated](https://docs.swmansion.com/react-native-reanimated/) · [Material easing](https://m3.material.io/styles/motion/easing-and-duration)
