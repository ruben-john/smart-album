/**
 * Script to perform a complete clean reinstall of canvas for Windows
 * Addresses the "specified procedure could not be found" error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Complete Canvas Rebuild for Windows ===');

function runCommand(command) {
  console.log(`> ${command}`);
  try {
    execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    return false;
  }
}

// Step 1: Remove node_modules and package-lock.json
console.log('\nStep 1: Cleaning up...');
if (fs.existsSync('node_modules')) {
  console.log('Removing node_modules directory...');
  if (process.platform === 'win32') {
    runCommand('rmdir /s /q node_modules');
  } else {
    runCommand('rm -rf node_modules');
  }
}

if (fs.existsSync('package-lock.json')) {
  console.log('Removing package-lock.json...');
  fs.unlinkSync('package-lock.json');
}

// Step 2: Install build prerequisites
console.log('\nStep 2: Installing build prerequisites...');
runCommand('npm install -g node-gyp');

// For Windows, we need GTK 2
if (process.platform === 'win32') {
  console.log('\nIMPORTANT: For Windows, ensure you have:');
  console.log('1. Visual Studio Build Tools (with C++ workload)');
  console.log('2. Python 3.x in your PATH');
  console.log('3. GTK 2 runtime (required by canvas)');
  console.log('\nYou can download GTK 2 from: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases');
  console.log('After installing, restart your computer before continuing.');
  
  // Prompt user to continue
  console.log('\nPress Enter to continue if you have these prerequisites installed...');
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).question('', () => {
    continueInstallation();
  });
} else {
  continueInstallation();
}

function continueInstallation() {
  // Step 3: Clean install with specific canvas version
  console.log('\nStep 3: Installing dependencies (without canvas)...');
  
  // Get all dependencies except canvas
  const packageJson = require('../package.json');
  const dependencies = { ...packageJson.dependencies };
  delete dependencies.canvas;
  
  // Install dependencies except canvas
  runCommand('npm install');
  
  // Step 4: Install canvas with specific flags for Windows
  console.log('\nStep 4: Installing canvas@2.9.3 (compatible with Node.js 16)...');
  
  // For Windows, we need additional flags
  if (process.platform === 'win32') {
    runCommand('npm install canvas@2.9.3 --build-from-source');
  } else {
    runCommand('npm install canvas@2.9.3');
  }
  
  // Step 5: Build the project
  console.log('\nStep 5: Building the project...');
  runCommand('npm run build');
  
  console.log('\n=== Canvas rebuild complete! ===');
  console.log('Try running the app with: npm run dev');
  console.log('If issues persist:');
  console.log('1. Make sure you\'ve installed all Windows prerequisites');
  console.log('2. Try running: npm config set msvs_version 2019');
  console.log('3. Try node-canvas-prebuilt instead: npm install node-canvas-prebuilt');
  
  // Close readline if we opened it
  if (process.platform === 'win32') {
    process.exit(0);
  }
} 