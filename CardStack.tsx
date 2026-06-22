import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { Card } from "./Card";
import { CARD_RED, CARD_YELLOW } from "./colors";

// Card-stack poses (degrees / px). The front card tilts left; the back card
// fans out to the right and sits slightly lower — matching the mock.
const FRONT = { rotate: -7, x: -20, y: 0 };
const BACK = { rotate: 9, x: 26, y: 14 };
const LIFT = 16; // upward arc applied mid-swap so the cards feel physical

// Tappable/animated footprint of the fanned stack.
export const STACK_W = 240;
export const STACK_H = 250;
// Gap between the resting stack and the bottom safe-area inset.
export const STACK_BOTTOM_GAP = 24;

export type CardSide = "yellow" | "red";

// Front/back drop-shadow elevation (Android). On Android `elevation` — not
// `zIndex` — governs touch order, so the front card must sit higher for taps in
// the overlap to land on it. Only diverge when interactive; the non-interactive
// splash keeps both cards at the resting elevation so its render stays identical.
const FRONT_ELEVATION = 8;
const BACK_ELEVATION = 4;

// The two fanned referee cards. `swap` drives the slide-and-stack toggle
// (0 = yellow in front, 1 = red in front). This is the single source of truth
// for card geometry — rendered identically by the app and the animated splash,
// which is what makes the splash→app handoff seamless.
//
// When `onSelect` is provided each card becomes its own tap target (select that
// color). Omitting it — as the splash does — renders inert cards. `current`
// feeds each card's accessibility `selected` state.
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

  // Yellow card travels FRONT -> BACK as swap goes 0 -> 1; red card does the reverse.
  const yellowStyle = useAnimatedStyle(() => {
    const p = swap.value;
    const lift = interpolate(p, [0, 0.5, 1], [0, -LIFT, 0]);
    return {
      zIndex: p < 0.5 ? 2 : 1,
      elevation: interactive ? (p < 0.5 ? FRONT_ELEVATION : BACK_ELEVATION) : FRONT_ELEVATION,
      transform: [
        { translateX: interpolate(p, [0, 1], [FRONT.x, BACK.x]) },
        { translateY: interpolate(p, [0, 1], [FRONT.y, BACK.y]) + lift },
        { rotate: `${interpolate(p, [0, 1], [FRONT.rotate, BACK.rotate])}deg` },
      ],
    };
  });

  const redStyle = useAnimatedStyle(() => {
    const p = swap.value;
    const lift = interpolate(p, [0, 0.5, 1], [0, -LIFT, 0]);
    return {
      zIndex: p < 0.5 ? 1 : 2,
      elevation: interactive ? (p < 0.5 ? BACK_ELEVATION : FRONT_ELEVATION) : FRONT_ELEVATION,
      transform: [
        { translateX: interpolate(p, [0, 1], [BACK.x, FRONT.x]) },
        { translateY: interpolate(p, [0, 1], [BACK.y, FRONT.y]) + lift },
        { rotate: `${interpolate(p, [0, 1], [BACK.rotate, FRONT.rotate])}deg` },
      ],
    };
  });

  return (
    <Animated.View style={styles.stack}>
      <Card
        color={CARD_YELLOW}
        style={yellowStyle}
        onPress={onSelect && (() => onSelect("yellow"))}
        accessibilityLabel="Yellow card"
        accessibilityHint="Shows the yellow card"
        selected={current === "yellow"}
      />
      <Card
        color={CARD_RED}
        style={redStyle}
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
    alignItems: "center",
    justifyContent: "center",
  },
});
