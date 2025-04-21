/**
 * Complete setup script for face recognition
 * This script runs all necessary steps to set up face recognition properly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('===============================================');
console.log('Face Recognition Setup - Smart Album v2');
console.log('===============================================\n');

// Function to execute a command and print its output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    return false;
  }
}

// Step 1: Fix canvas installation
console.log('\nSTEP 1: Fixing canvas installation for your platform...');
const fixCanvasResult = runCommand('node scripts/fix-canvas-windows.js');
if (!fixCanvasResult) {
  console.error('Canvas installation fix failed. Please check the error messages above.');
}

// Step 2: Download face recognition models
console.log('\nSTEP 2: Downloading face recognition models...');
const modelsResult = runCommand('node scripts/download-face-models.js');
if (!modelsResult) {
  console.error('Model download failed. Please check the error messages above.');
}

// Step 3: Build the project
console.log('\nSTEP 3: Building the project...');
const buildResult = runCommand('npm run build');
if (!buildResult) {
  console.error('Build failed. Please check the error messages above.');
}

// Check if models directory exists and has files
const modelsDir = path.join(__dirname, '../models');
let modelsExist = false;

if (fs.existsSync(modelsDir)) {
  const files = fs.readdirSync(modelsDir);
  modelsExist = files.length > 0;
}

console.log('\n===============================================');
console.log('Setup Complete!');
console.log('===============================================\n');

console.log('Summary:');
console.log(`- Canvas installation: ${fixCanvasResult ? '✅ Success' : '❌ Failed'}`);
console.log(`- Model download: ${modelsExist ? '✅ Success' : '❌ Not found'}`);
console.log(`- Build: ${buildResult ? '✅ Success' : '❌ Failed'}`);

console.log('\nRecommendation:');
console.log('- Node.js v16.x is recommended for this project (most stable)');
console.log('- Node.js v22 may work but might require additional troubleshooting');

if (!modelsExist) {
  console.log('\n⚠️ WARNING: Face recognition models not found!');
  console.log('Please manually download them from:');
  console.log('https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
  console.log(`And place them in: ${modelsDir}`);
}

console.log('\nNext steps:');
console.log('1. Run "npm run dev" to start the development server');
console.log('2. If face recognition still fails, check system requirements:');
console.log('   - Visual Studio Build Tools (Windows)');
console.log('   - Python 3.x');
console.log('   - Node.js version compatibility');
console.log('==============================================='); 