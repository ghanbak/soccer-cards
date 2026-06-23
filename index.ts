import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import App from './App';
import { widgetTaskHandler } from './widgets/android/widgetTaskHandler';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Android home-screen widgets render via a headless JS task; register its handler.
// Guarded to Android so the native module is never touched on iOS.
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
