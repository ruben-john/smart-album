/**
 * Script to fix canvas installation issues on Windows
 * 
 * This script:
 * 1. Uninstalls the existing canvas module
 * 2. Installs a version compatible with Windows and the current Node.js version
 * 3. Rebuilds the module if needed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting canvas fix for Windows...');

// Function to execute a command and print its output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    return false;
  }
}

// Get Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Determine best canvas version based on Node.js version
let canvasVersion = '2.9.3'; // Default for Node.js 16.x

if (nodeVersion.startsWith('v14')) {
  canvasVersion = '2.8.0';
} else if (nodeVersion.startsWith('v18')) {
  canvasVersion = '2.11.0';
} else if (nodeVersion.startsWith('v20')) {
  canvasVersion = '2.11.2';
} else if (nodeVersion.startsWith('v22')) {
  canvasVersion = '2.11.2'; // Latest version that works with Node.js v22
}

// Clean up existing installation
console.log('Removing existing canvas installation...');
runCommand('npm uninstall canvas');

// Make sure node-gyp is available with the right version
console.log('Installing node-gyp...');
runCommand('npm install -g node-gyp');

// Install Visual C++ Build Tools if on Windows
if (process.platform === 'win32') {
  console.log('On Windows - checking for build tools...');
  console.log('If this fails, you may need to install:');
  console.log('1. Visual Studio Build Tools 2019 or later');
  console.log('2. Python 3.x');
  console.log('Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/');
}

// Install compatible canvas version
console.log(`Installing canvas v${canvasVersion}...`);
const installSuccess = runCommand(`npm install canvas@${canvasVersion}`);

if (!installSuccess) {
  console.log('Installation failed. Trying with rebuild...');
  runCommand('npm rebuild');
  runCommand(`npm install canvas@${canvasVersion} --build-from-source`);
}

// Download face recognition models
console.log('Downloading face recognition models...');
runCommand('npm run download-face-models');

console.log('\nCanvas fix complete!');
console.log(`\nRECOMMENDATION: Node.js v16.x is the most stable for this project with face-api.js.`);
console.log(`While Node.js v22 can work, face-api.js and canvas dependencies work most reliably with Node.js v16.`);
console.log(`\nIf you continue having issues:`);
console.log('1. Downgrade to Node.js v16 for best compatibility');
console.log('2. Ensure all system dependencies are installed (Visual Studio Build Tools + Python)');
console.log('3. Run: npm run dev to test your setup'); 