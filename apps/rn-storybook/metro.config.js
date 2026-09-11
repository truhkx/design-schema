// Metro for a pnpm workspace: watch the whole repo (the stories live in packages/rn/src), resolve through
// both node_modules folders, follow pnpm's symlinks, and force one copy of React so hooks inside
// @design-schema/rn and the app never see two renderers. withStorybook (a named export since
// @storybook/react-native 10) regenerates .storybook/storybook.requires.ts on start.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;

const singletons = new Set(['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-native', 'react-native-svg']);
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (singletons.has(moduleName) || moduleName.startsWith('react-native/')) {
    return context.resolveRequest({ ...context, originModulePath: path.join(projectRoot, 'index.js') }, moduleName, platform);
  }
  return (defaultResolve || context.resolveRequest)(context, moduleName, platform);
};

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(projectRoot, '.storybook'),
});
