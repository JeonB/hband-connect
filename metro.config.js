const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

function loadNativeWind() {
  try {
    return require('nativewind/metro');
  } catch {
    try {
      return require(path.resolve(projectRoot, 'node_modules/nativewind/metro'));
    } catch {
      return null;
    }
  }
}

const nativewind = loadNativeWind();
if (!nativewind) {
  console.warn(
    '[metro] nativewind/metro not found — using default config. Run pnpm install and ensure nativewind is in dependencies for Tailwind styles.'
  );
}
module.exports = nativewind
  ? nativewind.withNativeWind(config, { input: './global.css' })
  : config;
