// Default (Android / web): no iOS widgets to register. The iOS implementation
// lives in registerWidgets.ios.ts and is picked by Metro's platform resolution —
// keeping the iOS-only expo-widgets / @expo/ui imports off other platforms.
export function registerWidgets(): void {}
