import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';

import { Card } from './Card';
import { CARD_RED, CARD_YELLOW } from './colors';

type CardSide = 'yellow' | 'red';

// Card-stack poses (degrees / px). The front card tilts left; the back card
// fans out to the right and sits slightly lower — matching the mock.
const FRONT = { rotate: -7, x: -20, y: 0 };
const BACK = { rotate: 9, x: 26, y: 14 };
const LIFT = 16; // upward arc applied mid-swap so the cards feel physical

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
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') pin();
      else if (state === 'background') restore();
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
  const [card, setCard] = useState<CardSide>('yellow');

  // 0 = yellow in front (initial), 1 = red in front. Decoupled from color identity.
  const swap = useSharedValue(0);
  const color = useSharedValue(0);

  useKeepAwake();
  useMaxBrightness();

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next: CardSide = card === 'yellow' ? 'red' : 'yellow';
    const target = next === 'red' ? 1 : 0;
    setCard(next);

    if (reduceMotion) {
      swap.value = target;
      color.value = target;
    } else {
      swap.value = withSpring(target, SWAP_SPRING);
      color.value = withTiming(target, { duration: BG_FADE_MS, easing: BG_EASING });
    }
  };

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(color.value, [0, 1], [CARD_YELLOW, CARD_RED]),
  }));

  // Yellow card travels FRONT -> BACK as swap goes 0 -> 1; red card does the reverse.
  const yellowStyle = useAnimatedStyle(() => {
    const p = swap.value;
    const lift = interpolate(p, [0, 0.5, 1], [0, -LIFT, 0]);
    return {
      zIndex: p < 0.5 ? 2 : 1,
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
      transform: [
        { translateX: interpolate(p, [0, 1], [BACK.x, FRONT.x]) },
        { translateY: interpolate(p, [0, 1], [BACK.y, FRONT.y]) + lift },
        { rotate: `${interpolate(p, [0, 1], [BACK.rotate, FRONT.rotate])}deg` },
      ],
    };
  });

  const label =
    card === 'yellow'
      ? 'Yellow card. Tap to show red card.'
      : 'Red card. Tap to show yellow card.';

  return (
    <Animated.View style={[styles.root, backgroundStyle]}>
      <StatusBar style="dark" />
      <View style={[styles.scene, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={styles.stack}
        >
          <Card color={CARD_YELLOW} style={yellowStyle} />
          <Card color={CARD_RED} style={redStyle} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CardScene />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // Sized to hug the fanned card-stack — the only tappable region.
  stack: {
    width: 240,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
