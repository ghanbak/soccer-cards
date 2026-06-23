import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { CardAndroidWidget } from "./CardAndroidWidget";

// Maps the configured widget `name` (app.json) to its rendered face. The headless
// task calls this for add/update/resize; a tap with clickAction OPEN_URI is opened
// natively (bookem://…), so WIDGET_CLICK needs no handling here.
const WIDGETS = {
  YellowCard: <CardAndroidWidget side="yellow" />,
  RedCard: <CardAndroidWidget side="red" />,
} as const;

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widget = WIDGETS[props.widgetInfo.widgetName as keyof typeof WIDGETS];
  if (!widget) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(widget);
      break;
    default:
      break;
  }
}
