import { useEffect, useRef, useState } from "react";
import { AppState, Pressable, StyleSheet, View, Text } from "react-native";
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
import { CardStack, STACK_BOTTOM_GAP } from "./CardStack";
import { CARD_RED, CARD_YELLOW } from "./colors";

// Hold the native splash until the JS splash overlay is ready to take over.
SplashScreen.preventAutoHideAsync().catch(() => {});

type CardSide = "yellow" | "red";

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
  const reduceMotion = useReducedMotion();
  const [card, setCard] = useState<CardSide>("yellow");

  // 0 = yellow in front (initial), 1 = red in front. Decoupled from color identity.
  const swap = useSharedValue(0);
  const color = useSharedValue(0);

  useKeepAwake();
  useMaxBrightness();

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next: CardSide = card === "yellow" ? "red" : "yellow";
    const target = next === "red" ? 1 : 0;
    setCard(next);

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

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      color.value,
      [0, 1],
      [CARD_YELLOW, CARD_RED],
    ),
  }));

  const label =
    card === "yellow"
      ? "Yellow card. Tap to show red card."
      : "Red card. Tap to show yellow card.";

  return (
    <Animated.View style={[styles.root, backgroundStyle]}>
      <StatusBar style="dark" />
      <View style={[styles.scene]}>
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={{ height: 200 }}
        >
          <CardStack swap={swap} />
        </Pressable>
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
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
