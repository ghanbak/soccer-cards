import { Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

import { CARD_YELLOW, OUTLINE } from "../colors";

// Tapping the widget opens the app on the yellow card via bookem://yellow (routed
// by cardLink.ts → select). On the Home Screen the whole tile fills yellow; on the
// Lock Screen the system renders it monochrome, so the "YELLOW" label — not colour
// — is what distinguishes the cards (this also covers colourblind users).
//
// Static widget: no props, so it renders from WidgetKit's default timeline entry
// without the app ever calling updateSnapshot().
const YellowCardWidget = (_props: object, environment: WidgetEnvironment) => {
  "widget";
  const accessory = environment.widgetFamily.startsWith("accessory");
  return (
    <VStack
      spacing={0}
      modifiers={[
        widgetURL("bookem://yellow"),
        containerBackground(CARD_YELLOW, "widget"),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
      ]}
    >
      <Spacer />
      <Text
        modifiers={[
          font({ weight: "bold", size: accessory ? 15 : 22 }),
          foregroundStyle(OUTLINE),
        ]}
      >
        YELLOW
      </Text>
      <Spacer />
    </VStack>
  );
};

export default createWidget("YellowCardWidget", YellowCardWidget);
