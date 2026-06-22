import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { OUTLINE } from './colors';

// A single card's dimensions. Exported so the card-stack and the animated
// splash can compute layout against the same source of truth.
export const CARD_W = 150;
export const CARD_H = 210;

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
    position: 'absolute',
    // Center within the parent independent of Yoga's absolute-child alignment:
    // anchor the top-left to the parent's center, then pull back by half the
    // card's own size. The parent's animated transform composes on top of this.
    top: '50%',
    left: '50%',
    width: CARD_W,
    height: CARD_H,
    marginTop: -CARD_H / 2,
    marginLeft: -CARD_W / 2,
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
