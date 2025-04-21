
/**
 * Canvas fallback adapter for Windows systems
 * This tries multiple canvas implementations and uses the first one that works
 */
let canvas;

function tryRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    return null;
  }
}

// Try multiple canvas implementations
const implementations = [
  'canvas',           // Standard canvas (native)
  'canvas-prebuilt',  // Prebuilt version
  '@napi-rs/canvas'   // Alternative implementation
];

for (const impl of implementations) {
  canvas = tryRequire(impl);
  if (canvas) {
    console.log(`Using canvas implementation: ${impl}`);
    break;
  }
}

if (!canvas) {
  throw new Error('Failed to load any canvas implementation. Face recognition will not work.');
}

module.exports = canvas;
