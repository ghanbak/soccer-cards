---
status: ready
priority: p2
issue_id: "004"
tags: [release, store-listing, assets]
dependencies: []
---

# Store listing copy, screenshots & privacy policy

Listing assets and metadata shared by both stores. Privacy policy is done; screenshots are partially captured.

## Problem Statement

Both stores need listing copy and screenshots (strictly required for closed/open tracks and the public listing; internal tracks can often go without). A hosted privacy policy is required by Play and external TestFlight.

## Findings

- Privacy policy: DONE — https://ghanbak.github.io/soccer-cards/privacy-policy.html (GitHub Pages, zero-data).
- Screenshots: raw frames staged in `.context/splash-capture/` (splash, fly-down, yellow resting) at 1206×2622 (iPhone 17 Pro).
- Gaps: a **red-state** screenshot needs a tap (couldn't be captured programmatically), and App Store wants a **6.9"** set (1320×2868) — best captured on a Pro Max simulator.

## Recommended Action

Capture clean yellow + red states at the required device sizes, write short listing copy, and pick categories.

## Acceptance Criteria

- [x] Zero-data privacy policy hosted at a stable URL.
- [ ] App Store + Play categories chosen (e.g., Sports / Entertainment).
- [ ] iOS screenshots: ≥1 set at 6.9" (1320×2868) — yellow + red states.
- [ ] Play screenshots: ≥2 phone screenshots.
- [ ] Listing copy written (name, subtitle/short description, full description).

## Work Log

### 2026-05-28 - Ported from release plan

**By:** Claude Code

**Actions:**
- Drafted + hosted the privacy policy (GitHub Pages).
- Staged candidate screenshots in `.context/splash-capture/`.

**Learnings:**
- Red-state capture needs an on-device tap; final store sizing needs a Pro Max sim.

## Notes

Source: release plan §3. Not strictly required for internal-only testing, but quick to finish and needed before closed/open or public listing.
