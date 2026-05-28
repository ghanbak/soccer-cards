# Soccer Cards — Brainstorm

**Date:** 2026-05-27
**Status:** Captured — ready to plan

## What We're Building

A dead-simple React Native mobile app (iOS + Android) for soccer fans to flash a red or yellow card at someone, ref-style. The entire screen is the card. Tap anywhere on screen to slide between the two states. The phone runs at max brightness while the app is in the foreground so the card is visible across a room (or pub).

**The whole product is one screen, two states, one interaction.** YAGNI is the design.

### Core UX

- **States:** Red card / Yellow card. Background fills edge-to-edge in the card color.
- **Initial state:** Yellow on every launch (no persistence).
- **Interaction:** Tap anywhere — including the small card-stack illustration at the bottom — to toggle.
- **Animation:** Slide/swap. Active card slides off; new card slides in from the opposite edge. Driven on the UI thread via Reanimated 3.
- **Haptics:** Medium impact haptic on every toggle.
- **Status bar:** Visible, color-matched to the background (per the mock).
- **Screen behavior:** Brightness pinned to 100% and screen kept awake while the app is foregrounded. Both restore to system defaults when the app backgrounds.
- **Visual reference:** `.context/attachments/6xdKUt/image.png` — solid color backgrounds with a small overlapping card-stack illustration in the bottom-center showing which card is "on top."

## Why This Approach

**Stack:** Expo (managed) + React Native + Reanimated 3.

- **Expo** gives us turnkey access to `expo-brightness`, `expo-keep-awake`, `expo-haptics`, and `expo-status-bar`, plus EAS for iOS + Android builds. For a one-screen app, dropping to bare RN buys nothing and costs a lot of native plumbing.
- **Reanimated 3** runs the slide on the UI thread so the toggle stays at 60fps even if JS is busy. The animation *is* the product, so this is worth the one dependency.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Expo (managed) | Native modules for brightness/keep-awake/haptics are first-party; fastest path to both stores |
| Animation library | Reanimated 3 | UI-thread perf; modern standard; composable for future tweaks |
| Toggle interaction | Tap anywhere on screen (including the card illustration) | Maximum hit target; matches "I just need to flash this" mental model |
| Animation style | Slide/swap | Feels like flicking through a wallet of cards; clearly directional |
| Initial state | Always Yellow | Yellow is the gentler first impression; less startling on accidental open |
| Persistence | None | Not worth a storage dep; the app is essentially stateless |
| Haptics | Medium impact on every toggle | Satisfying confirmation without being aggressive |
| Status bar | Visible, color-matched | Matches the mock; doesn't hide system info |
| Brightness | 100% while foregrounded, restore on background | Core feature — visibility across a room |
| Keep awake | On while foregrounded | Avoids auto-lock killing the moment |
| Orientation | Portrait only (assumed) | Refs hold cards portrait; simpler layout |
| Sound | None | Keep silent — haptics carry it |

## Scope (v1)

**In:**
- Single screen, two color states, tap-to-toggle slide animation
- Card-stack illustration at the bottom (decorative + tappable)
- Brightness max + keep-awake while foregrounded, restored on background
- Medium haptic on toggle
- iOS + Android via Expo / EAS

**Out (explicitly deferred):**
- Settings screen
- Multiple "cards" (e.g., subs, time-added, VAR)
- Sound effects
- Persisted state / app icon variants / widgets
- Landscape support
- Onboarding / first-run UI

## Open Questions

- **App name + bundle id** — needs to be picked before the first EAS build. Suggest something short ("Ref Cards", "Card!", "Whistle"). Defer to planning.
- **App icon + splash** — placeholder is fine for v1; can be designed alongside the build.
- **Brightness permission UX on Android** — `expo-brightness` system-wide brightness on Android requires `WRITE_SETTINGS`. App-level (window) brightness does not. Plan should confirm we're using the window-scoped API on both platforms (no permission prompt).
- **iOS Low Power Mode** — iOS may cap brightness when Low Power Mode is on. Acceptable v1 behavior is "best effort"; document this.
