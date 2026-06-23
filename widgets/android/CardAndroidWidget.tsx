import { FlexWidget, ImageWidget } from "react-native-android-widget";

import type { CardSide } from "../../CardStack";
import { CARD_RED, CARD_YELLOW } from "../../colors";

// Matches the Figma widget design (node 45:92): the two fanned cards with the
// active card large in front, on a full-bleed background of that card's colour —
// so the front card merges into the background and the other card stands out.
// Each side has its own artwork exported from Figma (yellow-active / red-active).
// Tapping opens bookem://<side> (cardLink.ts → select). The 654×581 PNGs preserve
// a ~1.126:1 aspect ratio.
const CARDS = {
  yellow: require("../../assets/widget-cards-yellow.png"),
  red: require("../../assets/widget-cards-red.png"),
};

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
      }}
    >
      <ImageWidget image={CARDS[side]} imageWidth={150} imageHeight={133} />
    </FlexWidget>
  );
}
