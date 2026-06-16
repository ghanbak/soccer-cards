import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardStack, STACK_BOTTOM_GAP, STACK_H } from "./CardStack";
import { CARD_YELLOW, OUTLINE } from "./colors";

const SPLASH_SCALE = 1.2; // cards start larger, shrink to 1.0 at rest
const ENTER_MS = 240; // content fades in over the bare-yellow native frame
const HOLD_MS = 320; // brief beat before the cards fly down
const TRAVEL_MS = 650;

// Code-driven splash. The native cold frame is a solid yellow; this overlay
// paints the same `CardStack` (plus the wordmark) on top, then flies the cards
// down into their resting position while the wordmark fades out. On completion
// it unmounts, revealing the live app whose CardStack sits at the identical
// resting geometry — an invisible handoff.
export function AnimatedSplash({
  onAnimationComplete,
}: {
  onAnimationComplete: () => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const swap = useSharedValue(0); // cards at rest (yellow in front)
  const progress = useSharedValue(0); // 0 = splash pose, 1 = resting pose
  const enter = useSharedValue(0); // content opacity

  // Stack center: from screen middle (splash) down to the app's resting spot,
  // computed from the same inputs CardScene uses.
  const splashCenterY = height * 0.4;
  const restingCenterY = height - (STACK_H - 88) / 2;
  const travel = restingCenterY - splashCenterY;

  // biome-ignore lint/correctness/useExhaustiveDependencies: run-once mount effect — adding these deps would replay the splash fly-in.
  useEffect(() => {
    // Reveal the JS layer (drawn over the identical yellow native frame).
    SplashScreen.hideAsync().catch(() => {});

    if (reduceMotion) {
      // No fly-in: hand straight to the app.
      runOnJS(onAnimationComplete)();
      return;
    }

    enter.value = withTiming(1, { duration: ENTER_MS });
    progress.value = withDelay(
      ENTER_MS + HOLD_MS,
      withTiming(
        1,
        { duration: TRAVEL_MS, easing: Easing.out(Easing.cubic) },
        (done) => {
          if (done) runOnJS(onAnimationComplete)();
        },
      ),
    );
  }, []);

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: progress.value * travel },
      { scale: SPLASH_SCALE - progress.value * (SPLASH_SCALE - 1) },
    ],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: enter.value * (1 - progress.value),
    transform: [{ translateY: progress.value * travel }],
  }));

  // Don't paint the centered cards under reduce-motion (we hand off immediately).
  if (reduceMotion) return <Animated.View style={styles.fill} />;

  return (
    <Animated.View style={styles.fill}>
      <Animated.View
        style={[styles.cards, { top: splashCenterY - STACK_H / 2 }, cardsStyle]}
      >
        <CardStack swap={swap} />
      </Animated.View>
      <Animated.Text
        style={[
          styles.wordmark,
          { top: splashCenterY + (STACK_H * SPLASH_SCALE) / 2 + 28 },
          wordmarkStyle,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        BOOK ’EM
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_YELLOW,
    zIndex: 10,
  },
  cards: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  wordmark: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: OUTLINE,
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: -1.44, // -2% of 72px (RN letter-spacing is absolute px)
  },
});
