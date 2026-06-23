import { FlexWidget, TextWidget } from "react-native-android-widget";

import type { CardSide } from "../../CardStack";
import { CARD_RED, CARD_YELLOW, OUTLINE } from "../../colors";

// Android home-screen widget face for one card. The whole tile is the card colour
// and a bold "YELLOW"/"RED" label keeps the two distinguishable for colourblind
// users. Tapping opens bookem://<side>, routed by cardLink.ts → select. (Android
// has no dependable lock-screen widget in 2026; the Quick Settings tile is the
// lock-screen path — this is the home-screen surface.)
export function CardAndroidWidget({ side }: { side: CardSide }) {
  const isRed = side === "red";
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `bookem://${side}` }}
      accessibilityLabel={isRed ? "Show red card" : "Show yellow card"}
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isRed ? CARD_RED : CARD_YELLOW,
        borderRadius: 16,
      }}
    >
      <TextWidget
        text={isRed ? "RED" : "YELLOW"}
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: isRed ? "#FFFFFF" : OUTLINE,
        }}
      />
    </FlexWidget>
  );
}
