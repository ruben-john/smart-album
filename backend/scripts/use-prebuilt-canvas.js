/**
 * Script to use prebuilt canvas modules instead of native ones
 * For Windows systems where native compilation fails
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Installing Prebuilt Canvas Modules for Windows ===');

// Function to run a command
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

// Step 1: Uninstall regular canvas
console.log('\nStep 1: Removing existing canvas installation...');
runCommand('npm uninstall canvas');

// Step 2: Install prebuilt alternatives
console.log('\nStep 2: Installing canvas-prebuilt and related packages...');
// First approach - try canvas-prebuilt
const canvasPrebuiltResult = runCommand('npm install canvas-prebuilt@2.9.3');

if (!canvasPrebuiltResult) {
  console.log('\nCanvas-prebuilt failed to install. Trying second approach...');
  // Second approach - try another prebuilt canvas library
  runCommand('npm install @napi-rs/canvas');
  
  // Create an adapter file to use @napi-rs/canvas instead of canvas
  const adapterPath = path.join(__dirname, '../src/utils/canvasAdapter.js');
  console.log(`\nCreating canvas adapter at ${adapterPath}`);
  
  fs.writeFileSync(adapterPath, `
/**
 * Canvas adapter that uses @napi-rs/canvas instead of node-canvas
 * This file is automatically created by the use-prebuilt-canvas.js script
 */
const napiCanvas = require('@napi-rs/canvas');

// Create adapter for node-canvas API
module.exports = {
  createCanvas: napiCanvas.createCanvas,
  loadImage: async (src) => {
    return await napiCanvas.loadImage(src);
  },
  Canvas: napiCanvas.Canvas,
  Image: napiCanvas.Image,
  ImageData: napiCanvas.ImageData
};
  `);

  // Create a TypeScript definition file
  const adapterDtsPath = path.join(__dirname, '../src/utils/canvasAdapter.d.ts');
  console.log(`Creating canvas adapter type definitions at ${adapterDtsPath}`);
  
  fs.writeFileSync(adapterDtsPath, `
/**
 * Type definitions for canvas adapter
 */
declare module '../utils/canvasAdapter' {
  export function createCanvas(width: number, height: number): any;
  export function loadImage(src: string): Promise<any>;
  export const Canvas: any;
  export const Image: any;
  export const ImageData: any;
}
  `);

  // Update faceRecognitionService.ts to use the adapter
  console.log('\nUpdating faceRecognitionService.ts to use the adapter...');
  
  const servicePath = path.join(__dirname, '../src/services/faceRecognitionService.ts');
  if (fs.existsSync(servicePath)) {
    let serviceCode = fs.readFileSync(servicePath, 'utf8');
    
    // Replace canvas import
    serviceCode = serviceCode.replace(
      "const canvas = require('canvas');", 
      "const canvas = require('../utils/canvasAdapter');"
    );
    
    fs.writeFileSync(servicePath, serviceCode);
    console.log('Successfully updated faceRecognitionService.ts to use the canvas adapter');
  } else {
    console.error('Could not find faceRecognitionService.ts to update');
  }
}

// Step 3: Rebuild the project
console.log('\nStep 3: Building the project...');
runCommand('npm run build');

console.log('\n=== Prebuilt Canvas Installation Complete ===');
console.log('Try running the application with: npm run dev');
console.log('If you still encounter issues:');
console.log('1. Make sure you have Git for Windows installed');
console.log('2. Try editing backend/src/services/faceRecognitionService.ts manually to use the canvas adapter');
console.log('3. Consider using a Linux/macOS environment or Docker for development'); 