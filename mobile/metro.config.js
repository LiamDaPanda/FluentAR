const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Resolve workspace packages (static JSON + mock scripts shared across the app).
config.resolver.extraNodeModules = {
  "@fluentar/shared": path.resolve(workspaceRoot, "shared"),
  "@fluentar/mocks": path.resolve(workspaceRoot, "mocks"),
};

module.exports = config;
