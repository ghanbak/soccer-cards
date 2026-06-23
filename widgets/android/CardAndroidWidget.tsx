import { FlexWidget } from "react-native-android-widget";

import type { CardSide } from "../../CardStack";
import { CARD_RED, CARD_YELLOW, OUTLINE } from "../../colors";

// Android home-screen widget face for one card — matched to the iOS widget and the
// app's active state: a rounded card with the dark #363636 outline (Card.tsx:
// borderRadius 22, borderWidth 4), inset on a full-bleed background of the same
// colour. Tapping opens bookem://<side> (cardLink.ts → select). Unlike the iOS
// 'widget' layout, this renders in the normal JS task, so the palette imports work.
export function CardAndroidWidget({ side }: { side: CardSide }) {
  const cardColor = side === "red" ? CARD_RED : CARD_YELLOW;
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `bookem://${side}` }}
      accessibilityLabel={side === "red" ? "Show red card" : "Show yellow card"}
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: cardColor,
        borderRadius: 28,
        padding: 12,
      }}
    >
      <FlexWidget
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: cardColor,
          borderWidth: 4,
          borderColor: OUTLINE,
          borderRadius: 18,
        }}
      />
    </FlexWidget>
  );
}
