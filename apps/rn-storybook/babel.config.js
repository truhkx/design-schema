module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 57) adds the react-native-worklets plugin itself when the package is
    // installed, which is what @gorhom/bottom-sheet (the on-device Storybook UI) needs under
    // Reanimated 4. Listing the plugin here as well would register it twice.
    presets: ['babel-preset-expo'],
  };
};
