import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Brightness from "expo-brightness";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { AnimatedSplash } from "./AnimatedSplash";
import { initialCard, useDeepLinkSelect } from "./cardLink";
import { CardStack, type CardSide, restingCenterY, STACK_H } from "./CardStack";
import { CARD_RED, CARD_YELLOW } from "./colors";

// Hold the native splash until the JS splash overlay is ready to take over.
SplashScreen.preventAutoHideAsync().catch(() => {});

const BG_FADE_MS = 120;
const BG_EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SWAP_SPRING = { dampingRatio: 0.7, duration: 450 };

// Pin screen brightness to max while the app is foregrounded; restore the
// user's original brightness when it backgrounds or unmounts.
function useMaxBrightness() {
  const original = useRef<number | null>(null);

  useEffect(() => {
    const pin = async () => {
      try {
        if (original.current == null) {
          original.current = await Brightness.getBrightnessAsync();
        }
        await Brightness.setBrightnessAsync(1);
      } catch {
        // Brightness control is best-effort (e.g. iOS Low Power Mode may cap it).
      }
    };
    const restore = async () => {
      try {
        if (original.current != null) {
          await Brightness.setBrightnessAsync(original.current);
        }
      } catch {}
    };

    pin();
    // Restore only on a real background transition, not transient 'inactive'.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") pin();
      else if (state === "background") restore();
    });

    return () => {
      sub.remove();
      restore();
    };
  }, []);
}

function CardScene() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  // Cold-start seed: if a deep link (widget, tile, Shortcut) launched the app,
  // start on that card so there's no yellow→red flash before first paint. Read
  // synchronously via initialCard() so the lazy initializer runs exactly once.
  const [card, setCard] = useState<CardSide>(initialCard);

  // 0 = yellow in front, 1 = red in front. Decoupled from color identity. Seeded
  // from the launch card on the first render (useSharedValue keeps the first arg).
  const swap = useSharedValue(card === "red" ? 1 : 0);
  const color = useSharedValue(card === "red" ? 1 : 0);

  useKeepAwake();
  useMaxBrightness();

  // Select a specific card. Idempotent: tapping the front card re-targets a value
  // already at rest (no visible motion) — the medium haptic is its confirmation.
  const select = (side: CardSide) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCard(side);
    const target = side === "red" ? 1 : 0;

    if (reduceMotion) {
      swap.value = target;
      color.value = target;
    } else {
      swap.value = withSpring(target, SWAP_SPRING);
      color.value = withTiming(target, {
        duration: BG_FADE_MS,
        easing: BG_EASING,
      });
    }
  };

  // Route warm/foreground `bookem://yellow|red` links into the same select path.
  // Cold start is handled by the initialCard() seed above.
  useDeepLinkSelect(select);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      color.value,
      [0, 1],
      [CARD_YELLOW, CARD_RED],
    ),
  }));

  return (
    <Animated.View style={[styles.root, backgroundStyle]}>
      <StatusBar style="dark" />
      {/* Stack center sits at the shared restingCenterY — the same datum the splash
          flies its cards to, so the handoff doesn't pop. Same parent box as the
          splash wrapper (full width, centered). */}
      <View
        style={[
          styles.stackHolder,
          { top: restingCenterY(height, insets) - STACK_H / 2 },
        ]}
        pointerEvents="box-none"
      >
        <CardStack swap={swap} onSelect={select} current={card} />
      </View>
    </Animated.View>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      <CardScene />
      {!splashDone && (
        <AnimatedSplash onAnimationComplete={() => setSplashDone(true)} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stackHolder: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
