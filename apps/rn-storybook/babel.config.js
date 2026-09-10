module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required by @gorhom/bottom-sheet (the on-device Storybook UI); must be last.
    plugins: ['react-native-reanimated/plugin'],
  };
};
