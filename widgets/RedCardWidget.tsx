import { HStack, RoundedRectangle, Text, ZStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  shadow,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

// Tapping opens the app on the red card (bookem://red, routed by cardLink.ts).
//
// Colours are INLINED, not imported: the 'widget' directive compiles this function
// into a constrained layout context that can't see module-scope imports (referencing
// `CARD_RED` from ../colors threw "Can't find variable"). Kept in sync with
// ../colors by hand: CARD_RED #FF0000, OUTLINE #363636.
const RedCardWidget = (_props: object, environment: WidgetEnvironment) => {
  "widget";
  const CARD = "#FF0000";
  const OUTLINE = "#363636";

  // Lock Screen accessory: rendered monochrome/tinted, so colour can't tell the
  // cards apart — a small card glyph + "RED" label does.
  if (environment.widgetFamily.startsWith("accessory")) {
    return (
      <HStack spacing={6} modifiers={[widgetURL("bookem://red")]}>
        <RoundedRectangle
          cornerRadius={4}
          modifiers={[foregroundStyle(CARD), frame({ width: 22, height: 30 })]}
        />
        <Text modifiers={[font({ weight: "bold", size: 17 })]}>RED</Text>
      </HStack>
    );
  }

  // Home Screen: mirror the app's active state — a portrait rounded card with the
  // dark outline, on a full-bleed background of the same colour. The outline shows
  // as the gap between the dark backing rect and the slightly smaller card rect.
  return (
    <ZStack
      modifiers={[
        widgetURL("bookem://red"),
        containerBackground(CARD, "widget"),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
      ]}
    >
      <RoundedRectangle
        cornerRadius={22}
        modifiers={[
          foregroundStyle(OUTLINE),
          frame({ width: 96, height: 126 }),
          // Soft black shadow offset downward, matching the app card
          // (Card.tsx: #000 @ ~0.18, radius 12, y 6). Without an explicit
          // colour the shadow renders as a white halo.
          shadow({ radius: 8, x: 0, y: 4, color: "#0000002E" }),
        ]}
      />
      <RoundedRectangle
        cornerRadius={18}
        modifiers={[foregroundStyle(CARD), frame({ width: 88, height: 118 })]}
      />
    </ZStack>
  );
};

export default createWidget("RedCardWidget", RedCardWidget);
