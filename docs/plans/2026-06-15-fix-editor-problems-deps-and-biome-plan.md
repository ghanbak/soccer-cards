---
title: Fix the 22 editor "Problems" (deps install + Biome)
type: fix
date: 2026-06-15
---

# 🐛 Fix the 22 editor "Problems" (deps install + Biome)

## TL;DR

The 22 Problems-panel rows reduce to **three causes**, and the fix is three actions:

1. **`npm install`** in the main checkout → clears the **18 `ts(...)` rows**.
2. **Swap one suppression comment** to Biome syntax → clears the **4 Biome lint rows**.
3. **`biome check --write`** → clears the **1 import-sort row**.

Then delete one uncommitted file left over from diagnosis. No new dependencies, no
new config, no behavior change. The codebase is sound — this is environment + tooling.

## Evidence (reproduced, not inspected)

Run in a fully-installed checkout:

- `tsc --noEmit` → **0 errors** (all five source files confirmed type-checked).
- `biome lint` → **4 findings**, all `useExhaustiveDependencies` on one `useEffect`.
- `biome check` → **1 assist finding**, `organizeImports`.

## The 22 rows → 3 causes

File paths in the panel resolve to `/Users/ethan/Github/soccer-cards/…` — the **main
checkout**, which currently has **no `node_modules`**. (`App.tsx`/`CardStack.tsx` show
no rows only because they weren't open; they'd show the same `ts` class.)

| # | Code | Source | File:Line | Cause |
|---|------|--------|-----------|-------|
| 1–5 | ts(2307) | ts | AnimatedSplash.tsx:1,2,11,12,13 | **A** — modules not on disk |
| 6 | ts(6142) | ts | AnimatedSplash.tsx:15 | **A** — `--jsx` unset (base tsconfig missing) |
| 7–10 | biome useExhaustiveDependencies | biome | AnimatedSplash.tsx:47 | **B** — wrong-linter suppression |
| 11 | ts(7006) | ts | AnimatedSplash.tsx:60 | **A** — `done` can't infer (reanimated types missing) |
| 12–16 | ts(17004) | ts | AnimatedSplash.tsx:80,83,84,91,93 | **A** — `--jsx` unset |
| 17–18 | ts(2307) | ts | Card.tsx:1,2 | **A** — modules not on disk |
| 19 | ts(2503) | ts | Card.tsx:14 | **A** — React types missing |
| 20 | ts(17004) | ts | Card.tsx:20 | **A** — `--jsx` unset |
| 21 | (none) | ts | tsconfig.json:2 | **A** — `expo/tsconfig.base` not found |
| 22 | biome organizeImports | biome | AnimatedSplash.tsx:1 | **C** — import order |

**Cause A (18 rows): `node_modules` not installed in the editor's open directory.**
Everything `ts` collapses here. The chain that makes this non-obvious:
`tsconfig.json` does `"extends": "expo/tsconfig.base"` (#21) — that base file lives in
`node_modules/expo/` and carries the `jsx`/`jsxImportSource` options. Missing →
`jsx` is unset → every JSX element errors (#6, #12–16, #20). `ts(7006)` (#11) and
`ts(2503)` (#19) are likewise just unresolved types. **Proof:** a clean install →
`tsc --noEmit` = 0 errors.

**Cause B (4 rows): an intentional run-once mount effect, suppressed with the wrong
linter's comment.** `AnimatedSplash.tsx:47` deliberately uses `[]` deps — adding
`enter`/`progress`/`onAnimationComplete`/`reduceMotion` would replay the splash
fly-in. The empty deps are *correct*. But the suppression at line 64 is
`// eslint-disable-next-line …`, and the editor's linter is **Biome**, which ignores
ESLint comments — so the rule still fires four times.

**Cause C (1 row): Biome's import-sort assist** wants `AnimatedSplash.tsx`'s imports
reordered. Cosmetic, auto-fixable.

## Fix

### Step 1 — Install deps in the main checkout (clears the 18 `ts` rows)

```bash
cd /Users/ethan/Github/soccer-cards
npm ci          # package-lock.json is committed
```

Then run **TypeScript: Restart TS Server** in the editor so it re-resolves.

> Worktree note: git worktrees don't share `node_modules`. Run `npm ci` inside each
> worktree you open in the editor. (Avoid symlinking a shared `node_modules` — the
> relative depth is fragile and Reanimated 4 + worklets are path-sensitive.) Worth a
> one-line mention in `AGENTS.md`.

### Step 2 — Fix the Biome suppression (clears the 4 lint rows)

The diagnostic is anchored at the **`useEffect(` call (line 47)**, so the
`biome-ignore` must sit on the line **immediately above `useEffect(`** — *not* above
the `}, []);` array. **Verified empirically:** above `useEffect(` → 0 findings; above
`}, []);` → still 4 findings *plus* a `suppressions/unused` warning.

So: **delete** the stale comment at line 64
(`// eslint-disable-next-line react-hooks/exhaustive-deps`), and **add**, on the blank
line directly above `useEffect(() => {` (line 47):

```tsx
  // biome-ignore lint/correctness/useExhaustiveDependencies: run-once mount effect — adding these deps would replay the splash fly-in.
  useEffect(() => {
```

Do **not** "fix" this by adding the dependencies — that changes runtime behavior.

### Step 3 — Sort imports (clears the 1 row)

```bash
cd /Users/ethan/Github/soccer-cards
npx @biomejs/biome check --write AnimatedSplash.tsx
```

### Step 4 — Clean up the diagnosis artifact

Reproducing this issue ran `expo lint`, which auto-created an `eslint.config.js` and
added ESLint deps to **this worktree's** `package.json`/`package-lock.json` (nothing
committed). Remove the noise:

```bash
git checkout package.json package-lock.json
rm -f eslint.config.js
```

## Out of scope (deliberately)

The repo commits no Biome config or `@biomejs/biome` dev dependency — the editor's
findings come from the extension's defaults. Pinning Biome per-repo (a `biome.json` +
exact dev dep + `lint`/`format` scripts) is a reasonable *separate* task, but it's not
needed to clear any of the 22 rows and would introduce formatter-churn decisions of
its own. If wanted, track it on its own so that tradeoff gets decided on its merits.

## Acceptance criteria

- [ ] `cd /Users/ethan/Github/soccer-cards && npm ci` succeeds; `node_modules` present. *(your machine — main checkout)*
- [ ] After **Restart TS Server**, the panel shows **0 `ts(...)` rows** for the open
      files (and for `App.tsx`/`CardStack.tsx` when opened). *(your editor)*
- [x] `node_modules/.bin/tsc --noEmit` exits 0. *(verified in worktree)*
- [x] `npx @biomejs/biome lint AnimatedSplash.tsx` → **0 findings** (no
      `useExhaustiveDependencies`, no `suppressions/unused`). *(verified)*
- [x] `npx @biomejs/biome check AnimatedSplash.tsx` → **0 assist findings**. *(verified, assist-only)*
- [ ] Splash still plays its fly-in once on cold start and respects reduce-motion
      (Step 2 is a comment swap + import reorder, not a logic change — manual sanity check).
- [x] `eslint.config.js` gone; `package.json`/`package-lock.json` reverted.

## Risks

- **Worktree friction (recurring):** every fresh worktree without `npm ci` reproduces
  the 18 `ts` rows. The `AGENTS.md` note mitigates.
- **No behavioral risk** in Steps 1–4: Step 1 is environment, Step 2 a comment,
  Step 3 import order, Step 4 cleanup. Runtime behavior is untouched.

## References

- Intentional mount effect: [AnimatedSplash.tsx:47](AnimatedSplash.tsx:47);
  stale comment to remove: [AnimatedSplash.tsx:64](AnimatedSplash.tsx:64).
- Base tsconfig: [tsconfig.json:2](tsconfig.json:2) → `expo/tsconfig.base`.
- Biome suppression syntax: https://biomejs.dev/linter/#suppress-lint-rules
- Expo SDK 56 (project pin): https://docs.expo.dev/versions/v56.0.0/
- v1 stays YAGNI — don't "improve" the splash logic:
  [docs/brainstorms/2026-05-27-soccer-cards-brainstorm.md](docs/brainstorms/2026-05-27-soccer-cards-brainstorm.md)
