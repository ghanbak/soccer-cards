import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { Card } from "./Card";
import { CARD_RED, CARD_YELLOW } from "./colors";

// Card-stack footprint. Each card is anchored to its own outer edge (yellow left,
// red right) and the stack bottom; the stack is STACK_W wide so the two cards sit
// side-by-side at rest, just touching. STACK_H is the active card's height.
export const STACK_W = 280;
export const STACK_H = 204;
// How far the stack extends past the bottom edge of the screen (cards bleed off).
export const BLEED = 72;

export type CardSide = "yellow" | "red";

// Resting geometry — the single source of truth shared by the live app (App.tsx)
// and the animated splash (AnimatedSplash.tsx). Returns the stack's CENTER-Y so
// both callers position CardStack identically; this is what keeps the splash→app
// handoff from popping. The fan (below) is zero at rest, so it never affects this.
export function restingCenterY(height: number, insets: { bottom: number }) {
  return height - insets.bottom - (STACK_H / 2 - BLEED);
}

// Two rest poses (swap 0 = yellow active, swap 1 = red active). The active card is
// larger and near-upright; the inactive card is smaller and tilted outward. Each
// color stays on its side — they never cross. Numbers tuned against Figma 39:63/39:46.
const ACTIVE_SCALE = 1;
const INACTIVE_SCALE = 0.84;
const ACTIVE_ROTATE = 2; // near-upright (deg, signed outward per side)
const INACTIVE_ROTATE = 8; // tilted outward
// Transient outward "fan": each card slides toward its own edge at mid-swap and
// returns to 0 at rest, so the promoted card reads as pulled out from behind.
const FAN = 20;

// Front/back drop-shadow elevation (Android). On Android `elevation` — not `zIndex`
// — governs touch order, so the front card must sit higher for overlap taps to land
// on it. Only diverge when interactive; the non-interactive splash keeps both at the
// resting elevation so its render stays identical.
const FRONT_ELEVATION = 8;
const BACK_ELEVATION = 4;

// The two fanned referee cards. `swap` drives the morph (0 = yellow in front,
// 1 = red in front). This is the single source of truth for card geometry — rendered
// identically by the app and the splash, which is what makes the handoff seamless.
//
// When `onSelect` is provided each card becomes its own tap target (select that
// color). Omitting it — as the splash does — renders inert cards. `current` feeds
// each card's accessibility `selected` state.
export function CardStack({
  swap,
  onSelect,
  current,
}: {
  swap: SharedValue<number>;
  onSelect?: (side: CardSide) => void;
  current?: CardSide;
}) {
  const interactive = onSelect != null;

  // Yellow: outer edge = LEFT, pivots/scales about its bottom-left corner so it grows
  // toward center; active at swap 0 -> inactive at swap 1; fans LEFT mid-swap.
  const yellowStyle = useAnimatedStyle(() => {
    const p = swap.value;
    return {
      zIndex: p < 0.5 ? 2 : 1,
      elevation: interactive
        ? p < 0.5
          ? FRONT_ELEVATION
          : BACK_ELEVATION
        : FRONT_ELEVATION,
      transform: [
        { translateX: interpolate(p, [0, 0.5, 1], [0, -FAN, 0]) },
        {
          rotate: `${interpolate(p, [0, 1], [-ACTIVE_ROTATE, -INACTIVE_ROTATE])}deg`,
        },
        { scale: interpolate(p, [0, 1], [ACTIVE_SCALE, INACTIVE_SCALE]) },
      ],
    };
  });

  // Red: outer edge = RIGHT — mirror of yellow.
  const redStyle = useAnimatedStyle(() => {
    const p = swap.value;
    return {
      zIndex: p < 0.5 ? 1 : 2,
      elevation: interactive
        ? p < 0.5
          ? BACK_ELEVATION
          : FRONT_ELEVATION
        : FRONT_ELEVATION,
      transform: [
        { translateX: interpolate(p, [0, 0.5, 1], [0, FAN, 0]) },
        {
          rotate: `${interpolate(p, [0, 1], [INACTIVE_ROTATE, ACTIVE_ROTATE])}deg`,
        },
        { scale: interpolate(p, [0, 1], [INACTIVE_SCALE, ACTIVE_SCALE]) },
      ],
    };
  });

  return (
    <Animated.View style={styles.stack}>
      <Card
        color={CARD_YELLOW}
        style={[styles.yellowAnchor, yellowStyle]}
        onPress={onSelect && (() => onSelect("yellow"))}
        accessibilityLabel="Yellow card"
        accessibilityHint="Shows the yellow card"
        selected={current === "yellow"}
      />
      <Card
        color={CARD_RED}
        style={[styles.redAnchor, redStyle]}
        onPress={onSelect && (() => onSelect("red"))}
        accessibilityLabel="Red card"
        accessibilityHint="Shows the red card"
        selected={current === "red"}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: STACK_W,
    height: STACK_H,
  },
  // Outer-edge + bottom anchors. transformOrigin pins the scale/rotate pivot to the
  // outer-bottom corner so the card grows toward center with its outer edge fixed.
  yellowAnchor: {
    left: 0,
    transformOrigin: "left bottom",
  },
  redAnchor: {
    right: 0,
    transformOrigin: "right bottom",
  },
});
