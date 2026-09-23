const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const defaultConfig = getDefaultConfig(projectRoot);

/**
 * Metro configuration for TECH2PLACE monorepo
 * Supports student, client, admin, and shared packages
 */
const config = {
  projectRoot,
  watchFolders: [
    path.resolve(projectRoot, 'shared'),
    path.resolve(projectRoot, 'student'),
    path.resolve(projectRoot, 'client'),
    path.resolve(projectRoot, 'admin'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
