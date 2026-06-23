import { FlexWidget, ImageWidget } from "react-native-android-widget";

import type { CardSide } from "../../CardStack";
import { CARD_RED, CARD_YELLOW } from "../../colors";

// The fanned two-card brand logo (same asset as the app icon) centered on a
// full-bleed background of the card's colour — so the yellow widget reads as the
// yellow card brought forward, the red widget as the red. Tapping opens
// bookem://<side> (cardLink.ts → select). FlexWidget can't rotate views, so the
// fan is baked into the (transparent) PNG.
const LOGO = require("../../assets/android-icon-foreground.png");

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
      <ImageWidget image={LOGO} imageWidth={150} imageHeight={150} />
    </FlexWidget>
  );
}
