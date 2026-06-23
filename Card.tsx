import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { OUTLINE } from './colors';

// A single card's dimensions — the active (front) pose size. The inactive card is
// the same box scaled down by the parent's animated transform.
export const CARD_W = 160;
export const CARD_H = 204;

// Animated so the touch target rides the same transform as the card's geometry.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardProps = {
  color: string;
  // Animated transform/zIndex style produced by the parent card-stack.
  style: React.ComponentProps<typeof Animated.View>['style'];
  // When provided, the card becomes a tappable button; otherwise it renders as a
  // plain animated view. The splash reuses this component non-interactively, so
  // omitting `onPress` keeps that render path byte-identical to before.
  onPress?: () => void;
  accessibilityLabel?: string;
  // Describes the tap action (the label conveys state, not what tapping does).
  accessibilityHint?: string;
  // Reflected to assistive tech so the current front card is announced.
  selected?: boolean;
};

// One referee card: a rounded rectangle with a thick dark outline and a soft shadow.
// Purely presentational — all motion comes from the `style` the parent passes in.
export function Card({
  color,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  selected,
}: CardProps) {
  const composedStyle = [styles.card, { backgroundColor: color }, style];
  if (onPress) {
    return (
      <AnimatedPressable
        style={composedStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected }}
      />
    );
  }
  return <Animated.View style={composedStyle} />;
}

const styles = StyleSheet.create({
  card: {
    // Positioning (outer-edge anchor + transformOrigin) is owned by the parent
    // CardStack; here the card is just an absolutely-positioned box pinned to the
    // bottom of the stack, on top of which the parent's animated transform composes.
    position: 'absolute',
    bottom: 0,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: OUTLINE,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
