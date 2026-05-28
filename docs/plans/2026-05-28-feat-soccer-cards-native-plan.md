---
title: Soccer Cards — Red/Yellow Referee App (Native iOS + Android)
type: feat
date: 2026-05-28
brainstorm: docs/brainstorms/2026-05-27-soccer-cards-brainstorm.md
alternative_to: docs/plans/2026-05-28-feat-soccer-cards-app-plan.md
---

# Soccer Cards — Red/Yellow Referee App (Native)

## Recommendation first

This builds the **same one-screen app twice** — SwiftUI on iOS, Jetpack Compose on Android — with no shared code. By the plan's own trade-off table below, the motion is equally buttery either way, so you are paying ~2× the code and two release pipelines **for native craft, not for capability**. A red/yellow flasher will never diverge across platforms.

**If the goal is to ship the product, take the React Native plan** (`2026-05-28-feat-soccer-cards-app-plan.md`) — one codebase, one pipeline, both stores. **Take this native plan only if you specifically want the SwiftUI + Compose craft** (learning, portfolio, native feel as an end in itself). That's a legitimate reason — just choose it with eyes open. These two plans are alternatives; build one.

## Overview

Full-screen background fills with the active card color; a small card-stack at the bottom shows which card is on top. Tapping the card-stack (only) toggles state — the cards do a slide-and-stack swap while the background cross-fades over 120ms. The phone runs at max brightness while foregrounded.

**Product rules (apply identically to both platforms):**
- Background **cross-fades** (does not slide) over **120ms** with a `(0.4, 0, 0.2, 1)` cubic-bezier curve.
- Slide-and-stack animation applies **only to the bottom card-stack**.
- Tap target **hugs the card-stack**; tapping the background does nothing.
- Always launch on **yellow**; no persistence.
- Medium-impact haptic on every toggle.
- Status bar visible, color-matched, dark icons.
- Max brightness + screen-awake while foregrounded; restored when backgrounded.
- Portrait locked.
- Reduce-motion / animations-disabled: state changes instantly; haptic still fires.
- Card-stack has an accessibility label that flips with state (e.g. "Yellow card. Tap to show red card.").

**Two files per platform.** One screen with no navigation, no state library, and one card-visual doesn't justify a `Theme` module or a standalone card file — constants live at the top of the screen file, and the card face is a ~15-line view inlined into the screen.

```
iOS:      SoccerCardsApp.swift   (entry; scenePhase → brightness + idle timer + status bar)
          ContentView.swift      (constants + background + card-stack + CardFace + tap + animation + haptic)

Android:  MainActivity.kt        (entry; keep-screen-on flag + edge-to-edge + status bar appearance)
          CardScreen.kt          (constants + background + card-stack + CardFace + tap + animation + haptic + brightness effect)
```

---

## Shared design (both platforms)

### State & animation

- One state value `card` (enum: `yellow` / `red`), initial `yellow`.
- **Background:** a color derived from `card`, animated **implicitly** by a value-driven 120ms cubic-bezier curve. SwiftUI: `.animation(.timingCurve(0.4, 0, 0.2, 1, duration: 0.12), value: card)`. Compose: `animateColorAsState(..., tween(120, easing = CubicBezierEasing(0.4f, 0f, 0.2f, 1f)))`.
- **Card-stack:** each of the two cards has a front pose and a back pose (`rotation`, `offset`). Both animate to the opposite pose on toggle via a spring (response ≈ 0.35, damping ≈ 0.75). A small upward `offset.y` toward the target adds the "lift" — just a spring on the offset, nothing fancier.
- **z-order:** flip `zIndex` **at toggle time** (discrete), so the newly-active card is immediately on top and rises over the other — it reads like dealing a card to the top of the stack. This is the deliberate v1 choice: value-driven implicit animations have no clean midpoint hook (unlike the RN plan's `useAnimatedReaction` at 0.5), and a discrete flip-on-top looks natural and needs no mid-animation machinery. (This is the one spot where native is genuinely *simpler to under-spec and harder to get a true cross-fade* than RN — we sidestep it by choosing flip-on-top rather than a true mid-swap z-cross.)

Two implicit `.animation(value: card)` modifiers with different curves on different views is the whole animation layer — cleaner than an imperative shared-value model for this shape.

### Tap

Wrap **only** the card-stack in the tappable region (`.contentShape(Rectangle())` on the iOS `ZStack`; `Modifier.wrapContentSize().clickable(...)` on the Compose `Box`) so it hugs the cards. On tap: fire a medium haptic, then flip `card`. If reduce-motion / animations-disabled is on, flip instantly (outside `withAnimation` on iOS; `snap()` spec on Compose); the haptic still fires. The card-stack carries a button role and a state-dependent accessibility label.

### Brightness — the one place with real lifecycle bugs

Capture the original brightness **once**, pin to max while foregrounded, restore when backgrounded.

- **iOS:** drive from `scenePhase`. Pin (`UIScreen.main.brightness = 1.0`, `isIdleTimerDisabled = true`) on `.active`. **Restore on `.background` only — not `.inactive`.** `.inactive` fires for transient interruptions (Control Center, notification banners, app-switcher peek); restoring on `.inactive` would flicker brightness and drop the idle timer mid-use. Guard the capture so it only reads the original the first time (`if originalBrightness == nil`), avoiding re-capturing `1.0` across a background→foreground→background cycle.
- **Android:** a **single** `DisposableEffect` that registers one `LifecycleEventObserver`, captures `original` once up front, pins window `screenBrightness = 1f` on `ON_RESUME`, restores `original` on `ON_PAUSE`, and removes the observer in `onDispose`. One mechanism, not two — the observer owns pin/restore; `onDispose` only cleans up. Window-scoped brightness needs no `WRITE_SETTINGS`.

iOS Low Power Mode may cap brightness — best-effort, no v1 UI.

### Keep-awake & status bar

- **iOS:** `isIdleTimerDisabled` toggled alongside brightness (see above). Status bar visible, dark content via `preferredColorScheme`. Portrait lock in target settings / `Info.plist`.
- **Android:** `FLAG_KEEP_SCREEN_ON` set once on the window in `MainActivity`. Edge-to-edge via `WindowCompat.setDecorFitsSystemWindows(window, false)`; dark status-bar icons via `WindowInsetsControllerCompat.isAppearanceLightStatusBars = true`; status-bar background follows the card color (snaps on change — imperceptible behind a 120ms fade). Portrait lock in the manifest.

---

## Acceptance criteria

Observable product behavior (verified by a device run per platform plus the reduce-motion + VoiceOver/TalkBack checks):

- [ ] Boots to yellow; tapping the card-stack toggles; tapping the background does nothing. *(both)*
- [ ] Medium / medium-equivalent haptic on each toggle. *(both)*
- [ ] Background cross-fades over 120ms with the `(0.4,0,0.2,1)` curve; cards spring-swap with a lift, newly-active card on top. *(both)*
- [ ] Screen is at max brightness while the app is open and **returns to the user's original brightness when backgrounded** — including across a background→foreground→background cycle (no stuck-bright). *(both)*
- [ ] Screen never sleeps while the app is open. *(both)*
- [ ] Status bar visible, dark icons, color-matched; portrait locked. *(both)*
- [ ] Reduce-motion / animations-disabled: state changes instantly, haptic still fires. *(both)*
- [ ] Accessibility label flips with state and reads under VoiceOver / TalkBack. *(both)*
- [ ] iOS only: brightness restores on `.background`, not on `.inactive` (no flicker on a notification banner / Control Center pull).
- [ ] Android only: no `WRITE_SETTINGS` permission prompt.

---

## Phases (mirror each other per platform)

### Phase 1 — Scaffold + system behavior
New Xcode / Android Studio project. Wire brightness lifecycle (with the `.background`-only / single-observer rules above), keep-awake, status-bar appearance, and portrait lock. Render the card-stack at rest matching the yellow mock, wrap it in the hugging tap target, and wire an **instant** (un-animated) toggle + haptic.
**Done when:** opening the app dims up to full brightness, never sleeps, and tapping the cards snaps between states with haptics; tapping the background does nothing.

### Phase 2 — Motion + polish + build
Add the 120ms color cross-fade and the spring card-swap (lift + flip-on-top z-order), plus the reduce-motion branch. Placeholder icon/splash. Accessibility pass (VoiceOver / TalkBack). Build and run on one physical device per platform.
**Done when:** the swap animates crisply, the background fades over 120ms, and all acceptance criteria are green on-device.

## Notes / Risks

- **iOS `.inactive` vs `.background`** — restore on `.background` only (covered above); the most likely correctness bug.
- **Android brightness** — one `DisposableEffect` + one `LifecycleEventObserver`, capture original once; do not also restore in `onDispose` as a second path.
- **Android "medium" haptic** — iOS has a literal `.medium`; Android's closest predefined effect (`EFFECT_HEAVY_CLICK` vs a custom `VibrationEffect`) needs a quick feel-test.
- **iOS Low Power Mode** caps brightness — known limitation, no v1 UI.

## Open questions

- **App name + bundle/application id** — pick before the first signed build.
- **Card hex values** — eyeballed against `.context/attachments/6xdKUt/image.png` at implementation time.
- **Spring constants** — start with response ≈ 0.35 / damping ≈ 0.75; tune by feel on-device.

## Trade-offs vs. the React Native plan

| | Native (this plan) | React Native / Expo |
|---|---|---|
| Codebases | **Two** (Swift + Kotlin), no shared code | One |
| LOC to ship & maintain | ~2× (every file written twice) | ~1× |
| Animation feel | Best possible; native physics | Excellent (Reanimated UI thread) |
| Brightness / haptics / keep-awake | Direct platform APIs, zero deps | `expo-*` wrappers (also solid) |
| Build / release | Xcode + Gradle, two pipelines forever | One EAS pipeline → both stores |
| Best when | You want native craft as an end in itself | You want to ship the product fastest |

## References

- Brainstorm: `docs/brainstorms/2026-05-27-soccer-cards-brainstorm.md` · Mock: `.context/attachments/6xdKUt/image.png`
- Consult at build time: SwiftUI `Animation.timingCurve` / `spring`, `UIScreen.brightness`, `UIApplication.isIdleTimerDisabled`, `scenePhase`; Compose `animateColorAsState` + `CubicBezierEasing`, `WindowManager.LayoutParams.screenBrightness`, `FLAG_KEEP_SCREEN_ON`, `WindowInsetsControllerCompat`, `LifecycleEventObserver`.
