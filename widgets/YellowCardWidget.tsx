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

// Tapping opens the app on the yellow card (bookem://yellow, routed by cardLink.ts).
//
// Colours are INLINED, not imported: the 'widget' directive compiles this function
// into a constrained layout context that can't see module-scope imports (referencing
// `CARD_YELLOW` from ../colors threw "Can't find variable"). Kept in sync with
// ../colors by hand: CARD_YELLOW #FFFF00, OUTLINE #363636.
const YellowCardWidget = (_props: object, environment: WidgetEnvironment) => {
  "widget";
  const CARD = "#FFFF00";
  const OUTLINE = "#363636";

  // Lock Screen accessory: rendered monochrome/tinted, so colour can't tell the
  // cards apart — a small card glyph + "YELLOW" label does.
  if (environment.widgetFamily.startsWith("accessory")) {
    return (
      <HStack spacing={6} modifiers={[widgetURL("bookem://yellow")]}>
        <RoundedRectangle
          cornerRadius={4}
          modifiers={[foregroundStyle(CARD), frame({ width: 22, height: 30 })]}
        />
        <Text modifiers={[font({ weight: "bold", size: 17 })]}>YELLOW</Text>
      </HStack>
    );
  }

  // Home Screen: mirror the app's active state — a portrait rounded card with the
  // dark outline, on a full-bleed background of the same colour. The outline shows
  // as the gap between the dark backing rect and the slightly smaller card rect.
  return (
    <ZStack
      modifiers={[
        widgetURL("bookem://yellow"),
        containerBackground(CARD, "widget"),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
      ]}
    >
      <RoundedRectangle
        cornerRadius={22}
        modifiers={[
          foregroundStyle(OUTLINE),
          frame({ width: 96, height: 126 }),
          shadow({ radius: 6 }),
        ]}
      />
      <RoundedRectangle
        cornerRadius={18}
        modifiers={[foregroundStyle(CARD), frame({ width: 88, height: 118 })]}
      />
    </ZStack>
  );
};

export default createWidget("YellowCardWidget", YellowCardWidget);
