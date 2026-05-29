---
status: pending
priority: p3
issue_id: "005"
tags: [release, ios, android, external-beta]
dependencies: ["002", "003"]
---

# Prepare for external / public beta (deferred)

Everything internal testing doesn't need but public beta does. Deferred until internal testing is working.

## Problem Statement

Going from internal to external/public testers triggers store review and additional metadata on both platforms — and surfaces the Apple "minimum functionality" risk for a one-screen flasher.

## Findings

- iOS external TestFlight requires Beta App Review + a privacy policy + complete App Privacy ("Data Not Collected") details + a public link.
- Play closed/open testing requires a full store listing (icon 512², feature graphic 1024×500, screenshots) before graduating the track.
- **Apple 4.2 "minimum functionality":** a pure red/yellow flasher is in the rejection blast radius for full App Store review. Mitigation already on the roadmap: ship the **"The Book" card counter (v1.1)** to add real functionality before/with public review. Internal TestFlight is unaffected.

## Recommended Action

To be filled during triage — revisit after internal testing is live and after deciding whether "The Book" counter lands before public review.

## Acceptance Criteria

- [ ] iOS: App Privacy details completed; Beta App Review submitted; external TestFlight link live.
- [ ] Play: full store listing (icon 512², feature graphic, screenshots); promoted to closed/open testing.
- [ ] Decision recorded on Apple 4.2 mitigation (ship "The Book" counter before public review?).

## Work Log

### 2026-05-28 - Ported from release plan

**By:** Claude Code

**Actions:**
- Captured external-beta requirements + the 4.2 risk as a future item.

**Learnings:**
- The flasher should gain the card counter before a public App Store review to clear minimum-functionality.

## Notes

Source: release plan §4. Pending triage — do not start until 002 and 003 are complete.
