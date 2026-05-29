---
title: "Book 'Em — App Icon, Splash, and Animated Splash→App Handoff"
type: feat
date: 2026-05-28
builds_on: docs/plans/2026-05-28-feat-soccer-cards-app-plan.md
---

# Book 'Em — App Icon, Splash, and Animated Splash→App Handoff

## Overview

Brand the app as **"Book 'Em"** and add a polished cold-launch experience: the cold frame is a solid-yellow native splash, then — once JS mounts — a **fully code-driven** splash paints the two cards (centered) and the "BOOK 'EM" wordmark, and the cards **fly down and shrink into their resting position** at the bottom of the app while the wordmark fades out. The cards the user watches travel are *literally the same component* the app renders at rest, so the handoff is seamless by construction. No splash image asset — the cards and wordmark are rendered in code (the icon stays a PNG; platforms require that).

Also retunes the palette to pure primaries and recolors the card outline (and the wordmark) to `#363636`.

Builds on the shipped flasher (`App.tsx`, `Card.tsx`, `colors.ts`).

## Decisions (locked with the user)

| Decision | Choice |
|---|---|
| App display name | **Book 'Em** (slug/bundle id unchanged) |
| Yellow / Red / Outline+text | **`#FFFF00`** / **`#FF0000`** / **`#363636`** |
| Asset source | I generate them (icon art works at 1024²; I recreate the splash cards to the app's exact colors) |
| Wordmark during animation | Fades **out** as the cards travel |
| When the animation plays | Cold launch only |
| Animation | Cards travel from centered splash pose → bottom resting pose (translate + scale); poses unchanged |
| Splash rendering | **Fully code-driven** — native splash is a solid `#FFFF00` color (no image); cards + wordmark are React components |
| Wordmark type | System default font, **72px**, **heavy** weight (`fontWeight: '900'`), **letterSpacing -1.44** (≈ -2% of 72px), color `#363636`, text `BOOK ’EM` |

## The seam: extract `CardStack` (decided after review)

Three reviewers split on how to guarantee a zero-jump handoff. A constants module (`theme.ts`) was rejected: shared numbers don't stop the two renderers' *JSX* from drifting. Instead, **extract the resting card-stack into one presentational component, `CardStack`**, used by both the app and the splash. The handoff is then guaranteed because both render the identical component — and this also removes the need for any constants module (geometry lives in the component that draws it).

- **`CardStack.tsx`** (new) — renders the two `<Card>`s at the `FRONT`/`BACK` poses inside the stack wrapper; owns `FRONT`/`BACK`, `STACK_W/H`, `STACK_BOTTOM_GAP`, the per-card swap `useAnimatedStyle`s, and the midpoint z-swap. Takes a `swap` shared value as a prop.
- **`App.tsx` / `CardScene`** — owns the tap handler, brightness, keep-awake, status bar, and the live `swap`/`color` shared values; renders `<CardStack swap={swap} />`.
- **`AnimatedSplash.tsx`** — renders the same `<CardStack swap={zero} />` inside an outer animated wrapper that drives only `translateY`/`scale`.

`Card.tsx` continues to own a single card's size (`CARD_W`/`CARD_H` exported for layout math) and outline. No `theme.ts`.

## Visual specs

- **Icon** (`assets/icon.png`, 1024²): full-bleed `#FFFF00`; yellow card front-left ~ -7°, red behind-right ~ +9°; `#363636` outline. (From the supplied icon art.)
- **Android adaptive icon**: `foregroundImage` = cards on transparent; `backgroundColor` = `#FFFF00`.
- **Native splash**: solid `#FFFF00` background, **no image**. The cold frame is just yellow; cards + wordmark paint in code the moment JS mounts (both layers are yellow, so there's nothing to pixel-match).
- **Wordmark**: text `BOOK ’EM` in `#363636`, **system default font, `fontSize: 72`, `fontWeight: '900'`, `letterSpacing: -1.44`** (RN letter-spacing is absolute px; -2% of 72px = -1.44). Centered below the cards, rendered in code. (RN can't readily address iOS "SF Compact" without bundling a font; v1 uses the system default at heavy weight — a bundled display face is a documented v1.x follow-up.)

## Technical approach

### 1. Palette + text color (`colors.ts`)

```ts
export const CARD_YELLOW = '#FFFF00';
export const CARD_RED = '#FF0000';
export const OUTLINE = '#363636'; // card outline AND wordmark/text in v1
```

No `TEXT` alias — the wordmark uses `OUTLINE` directly. Introduce a distinct `TEXT` only the day a label needs a different color. `Card.tsx` already consumes `OUTLINE` for its border; only the value changes.

### 2. App name + icon (`app.json`, assets)

- `expo.name` → `"Book 'Em"`. Leave `slug` and `ios.bundleIdentifier` untouched.
- `assets/icon.png` ← supplied art, resized to 1024².
- `android.adaptiveIcon.backgroundColor` → `#FFFF00`; `foregroundImage` → cards-on-transparent.

### 3. Native splash (`expo-splash-screen` config plugin)

SDK 52+ uses the **plugin**, not the legacy top-level `splash` key. Verify keys against the SDK 56 docs at build time (`AGENTS.md`). **Color only — no `image`** — so the cold frame is solid yellow and everything else is code:

```jsonc
["expo-splash-screen", { "backgroundColor": "#FFFF00" }]
```

### 4. Animated splash → app handoff (`AnimatedSplash.tsx`)

Expo "AnimatedAppLoader" pattern: hold the native splash, render an identical JS layer, hide the native splash beneath it, animate the JS layer, unmount.

1. Module scope: `SplashScreen.preventAutoHideAsync().catch(() => {})` (guard the promise).
2. App mounts. `AnimatedSplash` renders full-screen `#FFFF00` with `<CardStack swap={0}>` at the **splash pose** (centered, scaled ~1.6×) + the coded `BOOK ’EM` wordmark below it. The content (cards + wordmark) **fades in 0→1 over ~180ms** on mount — the native cold frame is bare yellow, so a soft entrance reads better than a hard pop. (Background is yellow on both the native and JS layers, so there is nothing to pixel-match.)
3. Call `SplashScreen.hideAsync()` from the content's **`onLayout`** (not a timer) — paints the JS layer before the native splash lifts.
4. After a brief hold (~150ms), drive one `progress` shared value: `withTiming(1, { duration: ~650, easing: Easing.out(Easing.cubic) })`:
   - wrapper `translateY`: splash-center → resting bottom (computed from window height + `useSafeAreaInsets` + `STACK_BOTTOM_GAP`, the same inputs `CardScene` uses)
   - wrapper `scale`: ~1.6 → 1.0
   - wordmark `opacity`: 1 → 0
5. On finish → `onAnimationComplete()` → unmount overlay → live app revealed with `<CardStack swap={swap}>` already at the identical resting geometry → invisible handoff.

**Reduce-motion** (`useReducedMotion()` at mount): skip the fly-in; fade the overlay opacity 1→0 over ~200ms and unmount. (Splash only renders on cold-launch mount, so a mid-session reduce-motion flip can't affect it — no extra handling.)

**Cold-launch only:** the overlay renders on initial mount and unmounts after the animation; foregrounding never remounts it — no extra logic.

### 5. `App.tsx` orchestration

- `preventAutoHideAsync()` at module scope (guarded).
- A `splashDone` state; render `<AnimatedSplash onAnimationComplete={() => setSplashDone(true)} />` over `CardScene` until done.
- `CardScene` renders `<CardStack swap={swap} />`; passes the resting layout inputs it already computes.

## Files

| File | Change |
|---|---|
| `colors.ts` | New hex values; wordmark uses `OUTLINE` (no `TEXT`) |
| `CardStack.tsx` | **New** — the shared resting/animated stack (poses, wrapper, swap styles, z-swap) |
| `App.tsx` | Use `CardStack`; splash gate + `preventAutoHideAsync` |
| `AnimatedSplash.tsx` | **New** — yellow overlay, coded `CardStack` + `BOOK ’EM` text, entrance fade-in + fly-down + wordmark fade-out |
| `Card.tsx` | Export `CARD_W`/`CARD_H`; inherits new `OUTLINE` value |
| `app.json` | `name` → "Book 'Em"; `expo-splash-screen` plugin (color only); adaptive icon bg `#FFFF00` |
| `assets/icon.png` | Regenerated 1024² |
| `assets/android-icon-foreground.png` | Cards on transparent |

No `theme.ts`, no `TEXT`, no bundled font, no `expo-font`, **no splash image** for v1. The only generated images are the app icon and its Android adaptive foreground (platforms require PNG icons).

## Dependencies

- `npx expo install expo-splash-screen` (plugin + `preventAutoHideAsync`/`hideAsync`)

## Asset generation (I produce these)

Only the app icon is an image — the splash is entirely code.

- **icon.png**: resize supplied `uO6meN/image.png` to 1024² (already final art on `#FFFF00`).
- **android-icon-foreground.png**: cards on transparent, sized to the adaptive safe zone.
- Recolor to the locked palette if the source PNG's hues differ, so the icon matches the runtime exactly.

## Acceptance criteria

- [ ] Display name reads **"Book 'Em"** under the icon on both platforms.
- [ ] Icon matches the supplied art; Android adaptive icon background is `#FFFF00`.
- [ ] Card outline and wordmark render `#363636`; in-app yellow `#FFFF00`, red `#FF0000`.
- [ ] Splash is fully code-driven: the native cold frame is solid `#FFFF00` with **no image asset**; cards and wordmark are React components.
- [ ] Wordmark renders `BOOK ’EM` at `fontSize: 72`, `fontWeight: '900'`, `letterSpacing: -1.44`, color `#363636`.
- [ ] The app and the splash render the **same `CardStack` component** (single source of truth).
- [ ] Cold launch: solid-yellow native frame → cards + wordmark fade in → cards fly down + shrink into the resting position while the wordmark fades out → app, with **no visible jump, scale pop, or color shift** at the handoff (verify on-device).
- [ ] Returning from background does **not** replay the splash.
- [ ] Reduce-motion at launch: overlay fades out, no fly-in.
- [ ] The async splash calls (`preventAutoHideAsync`/`hideAsync`) cannot throw an unhandled rejection.

(Build gate, not a product criterion: `tsc` clean + iOS/Android bundle before opening the PR.)

## Implementation phases

1. **JS refactor (hot-reloads)** — update `colors.ts`; extract `CardStack` from `App.tsx`; point `CardScene` at it. Verify the running app is identical except for the new colors.
2. **Branding + animated splash (one native rebuild)** — generate icon + adaptive-foreground PNGs; set `app.json` name + `expo-splash-screen` plugin (color only) + adaptive bg; `npx expo install expo-splash-screen`; build the code-driven `AnimatedSplash.tsx` (CardStack + `BOOK ’EM` text) + the splash gate. Rebuild once; on-device verify the handoff, the reduce-motion path, and background→foreground (no replay). Capture before/after for the PR.

## Risks

- **Handoff jump** → mitigated by both layers rendering the same `CardStack` and computing the resting center from the same insets `CardScene` uses.
- **`hideAsync` timing flash** → tie it to the wrapper's `onLayout`, never a timer.
- **`expo-splash-screen` plugin keys differ in SDK 56** → verify against versioned docs at build time.
- **Native rebuild required** for icon/splash/name changes (not a JS hot-reload).

## Open questions

- **Exact splash card scale + travel duration** — start ~1.6× / ~650ms ease-out; tune by feel on-device.

## References

- Builds on: `docs/plans/2026-05-28-feat-soccer-cards-app-plan.md`
- Splash mock: `.context/attachments/POvbbt/image.png` · Icon art: `.context/attachments/uO6meN/image.png`
- Verify at build time: [expo-splash-screen](https://docs.expo.dev/versions/v56.0.0/sdk/splash-screen/) · [App icons & splash](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/) · [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
