import RedCardWidget from "./widgets/RedCardWidget";
import YellowCardWidget from "./widgets/YellowCardWidget";

// Importing each widget module runs createWidget(), which registers the widget's
// layout into the shared app-group container so the WidgetKit extension can render
// it. updateSnapshot then writes an initial timeline entry. Without this step the
// widgets show "unable to load" — the layout is never written. Our card widgets
// take no props, so an empty snapshot is all they need.
export function registerWidgets(): void {
  YellowCardWidget.updateSnapshot({});
  RedCardWidget.updateSnapshot({});
}
