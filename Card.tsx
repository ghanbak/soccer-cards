import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { OUTLINE } from './colors';

// A single card's dimensions. Exported so the card-stack and the animated
// splash can compute layout against the same source of truth.
export const CARD_W = 150;
export const CARD_H = 210;

type CardProps = {
  color: string;
  // Animated transform/zIndex style produced by the parent card-stack.
  style: React.ComponentProps<typeof Animated.View>['style'];
};

// One referee card: a rounded rectangle with a thick dark outline and a soft shadow.
// Purely presentational — all motion comes from the `style` the parent passes in.
export function Card({ color, style }: CardProps) {
  return <Animated.View style={[styles.card, { backgroundColor: color }, style]} />;
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
