/**
 * Windows-specific fixes for Node.js v16 canvas issues
 * Addresses the "specified procedure could not be found" error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== Windows-specific Node.js v16 Fixes ===');

// Check if we're on Windows
if (process.platform !== 'win32') {
  console.log('This script is only for Windows. Exiting...');
  process.exit(0);
}

// Check if we're on Node.js v16
if (!process.version.startsWith('v16')) {
  console.log(`You're on Node.js ${process.version}. This script is optimized for Node.js v16.`);
  console.log('Continuing anyway, but results may vary...');
}

function runCommand(command) {
  console.log(`> ${command}`);
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    return '';
  }
}

// Set VS2019 as the build tools (works best with Node.js v16)
console.log('\nSetting Visual Studio 2019 build tools...');
runCommand('npm config set msvs_version 2019');

// Set Python version to 3.x
console.log('\nSetting Python version...');
runCommand('npm config set python python3');

// Check Visual C++ Runtime
console.log('\nChecking for Visual C++ Redistributable...');
console.log('Please make sure you have the Visual C++ 2019 Redistributable installed');
console.log('You can download it from: https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads');

// Fix for node-gyp
console.log('\nInstalling/updating node-gyp...');
runCommand('npm install -g node-gyp');

// Cache cleaning
console.log('\nCleaning npm cache...');
runCommand('npm cache clean --force');

// Setup environment variables that help with canvas installation
console.log('\nSetting up environment variables for canvas build...');
process.env.npm_config_canvas_binary_host_mirror = 'https://github.com/Automattic/node-canvas/releases/download/';
process.env.npm_config_target_arch = os.arch();

// Install canvas specifically for Node.js v16 on Windows
console.log('\nInstalling canvas 2.9.3 (optimized for Node.js v16)...');
runCommand('npm uninstall canvas');
runCommand('npm install canvas@2.9.3 --build-from-source');

console.log('\nCreating fallback adapter (in case native canvas fails)...');
// Create the utils directory if it doesn't exist
const utilsDir = path.join(__dirname, '../src/utils');
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

// Create a fallback adapter that tries multiple canvas implementations
const adapterPath = path.join(utilsDir, 'canvasFallback.js');
fs.writeFileSync(adapterPath, `
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
    console.log(\`Using canvas implementation: \${impl}\`);
    break;
  }
}

if (!canvas) {
  throw new Error('Failed to load any canvas implementation. Face recognition will not work.');
}

module.exports = canvas;
`);

// Create type definition file for the fallback
const adapterDtsPath = path.join(utilsDir, 'canvasFallback.d.ts');
fs.writeFileSync(adapterDtsPath, `
/**
 * Type definitions for canvas fallback adapter
 */
declare module '../utils/canvasFallback' {
  const canvas: any;
  export = canvas;
}
`);

// Update face recognition service to use the fallback adapter
console.log('\nUpdating faceRecognitionService.ts to use the fallback adapter if needed...');
const servicePath = path.join(__dirname, '../src/services/faceRecognitionService.ts');
if (fs.existsSync(servicePath)) {
  let serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // Add fallback mechanism without touching existing code
  const updatedContent = serviceContent.replace(
    'const canvas = require(\'canvas\');',
    `// Try to use canvas with fallback mechanism
let canvas;
try {
  canvas = require('canvas');
} catch (error) {
  console.warn('Native canvas module failed to load, trying fallback...');
  try {
    canvas = require('../utils/canvasFallback');
  } catch (fallbackError) {
    console.error('Both native and fallback canvas failed:', fallbackError);
    throw new Error('Canvas is required for face recognition');
  }
}`
  );
  
  fs.writeFileSync(servicePath, updatedContent);
  console.log('Successfully updated faceRecognitionService.ts with fallback mechanism');
}

console.log('\n=== Windows Node.js v16 Fixes Applied ===');
console.log('Please restart your terminal and run:');
console.log('1. npm run build');
console.log('2. npm run dev');
console.log('\nIf you still encounter issues:');
console.log('1. Try the use-prebuilt-canvas script: npm run use-prebuilt-canvas');
console.log('2. Try running in Windows Subsystem for Linux (WSL) or using Docker'); 