module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 moved the worklets engine into react-native-worklets.
    // This plugin MUST be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
