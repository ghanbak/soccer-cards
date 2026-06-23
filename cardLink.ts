// Deep-link router: maps `bookem://yellow` / `bookem://red` to a card.
//
// This is the single entry point every external trigger (widgets, Quick Settings
// tiles, Siri Shortcuts) funnels through — each just opens a `bookem://<side>`
// URL, and the app turns that into a `select(side)` call. Phase 0 is pure JS and
// works today via `npx uri-scheme open bookem://red` before any native widget
// exists.
//
// Behaviour measured against expo-linking 56 `parse` (see plan AC3): for
// `bookem://red` the card lands in `hostname` (path is null); for `bookem://Red/`
// the trailing slash lands in `path` as "" and never in the chosen value, so
// `.toLowerCase()` is what normalises case and the slash-strip is only defensive
// for the rare `path`-fallback branch. Unknown hosts (`bookem://settings`) and the
// bare scheme (`bookem://`) map to null — a no-op, never a crash.

import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";

import type { CardSide } from "./CardStack";

const ALLOWED: Record<string, CardSide> = { yellow: "yellow", red: "red" };

// Map a launch/incoming URL to a card, or null for anything unrecognised.
export function cardFromUrl(url: string | null): CardSide | null {
  if (!url) return null;
  try {
    const { hostname, path } = Linking.parse(url);
    const key = (hostname ?? path ?? "").toLowerCase().replace(/\/+$/, "");
    return ALLOWED[key] ?? null;
  } catch {
    return null;
  }
}

// Cold start: the URL that launched the app, read SYNCHRONOUSLY so the initial
// card can be seeded before first paint — no yellow→red flash. Defaults to yellow
// (the app's normal initial state) when not launched by a link.
export function initialCard(): CardSide {
  return cardFromUrl(Linking.getLinkingURL()) ?? "yellow";
}

// Warm / foreground: route subsequent `bookem://` links into `select`. Subscribes
// once and always calls the latest `select` via a ref, so a re-created `select`
// closure each render never churns the listener.
export function useDeepLinkSelect(select: (side: CardSide) => void): void {
  const selectRef = useRef(select);
  selectRef.current = select;

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      const side = cardFromUrl(url);
      if (side) selectRef.current(side);
    });
    return () => sub.remove();
  }, []);
}
