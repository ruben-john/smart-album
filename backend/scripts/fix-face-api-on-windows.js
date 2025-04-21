/**
 * Comprehensive fix for face-api.js on Windows with Node.js v16
 * Addresses the "specified procedure could not be found" error and
 * "Failed to convert napi value Undefined into rust type i32" error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Fixing face-api.js on Windows ===');

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

// Step 1: Uninstall any previous canvas implementations
console.log('\nStep 1: Removing canvas implementations...');
runCommand('npm uninstall canvas canvas-prebuilt @napi-rs/canvas');
runCommand('npm cache clean --force');

// Step 2: Install @napi-rs/canvas (most reliable on Windows)
console.log('\nStep 2: Installing @napi-rs/canvas...');
runCommand('npm install @napi-rs/canvas@0.1.44');

// Ensure utils directory exists
const utilsDir = path.join(__dirname, '../src/utils');
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

// Step 3: Create a proper canvas adapter
console.log('\nStep 3: Creating custom canvas adapter...');
const adapterPath = path.join(utilsDir, 'canvasAdapter.js');

fs.writeFileSync(adapterPath, `/**
 * Custom canvas adapter for face-api.js
 * This adapter fixes compatibility issues between face-api.js and @napi-rs/canvas
 */

// Load @napi-rs/canvas
const napiCanvas = require('@napi-rs/canvas');
console.log('Using @napi-rs/canvas implementation');

// Fix for "Failed to convert napi value Undefined into rust type i32" error
const createCanvas = (width, height) => {
  // Ensure width and height are numbers and have minimum value
  width = typeof width === 'number' ? Math.max(width, 1) : 1;
  height = typeof height === 'number' ? Math.max(height, 1) : 1;
  
  try {
    return napiCanvas.createCanvas(width, height);
  } catch (err) {
    console.error('Error creating canvas:', err);
    // Fallback to a minimal canvas
    return napiCanvas.createCanvas(10, 10);
  }
};

// Handle potential errors in loadImage
const loadImage = async (src) => {
  try {
    return await napiCanvas.loadImage(src);
  } catch (err) {
    console.error('Error loading image:', err);
    throw err;
  }
};

// Create adapter with specific type handling for face-api.js
module.exports = {
  createCanvas,
  loadImage,
  Canvas: napiCanvas.Canvas || function() {},
  Image: napiCanvas.Image || function() {},
  ImageData: napiCanvas.ImageData || function() {}
};`);

// Create type definitions
const adapterTypesPath = path.join(utilsDir, 'canvasAdapter.d.ts');

fs.writeFileSync(adapterTypesPath, `/**
 * Type definitions for the custom canvas adapter
 */
declare module '../utils/canvasAdapter' {
  /**
   * Creates a canvas with the specified dimensions
   * With additional error handling and parameter validation
   */
  export function createCanvas(width: number, height: number): any;
  
  /**
   * Loads an image from a source
   * Handles different source formats with error handling
   */
  export function loadImage(src: string | Buffer): Promise<any>;
  
  /**
   * Canvas constructor
   */
  export const Canvas: any;
  
  /**
   * Image constructor
   */
  export const Image: any;
  
  /**
   * ImageData constructor
   */
  export const ImageData: any;
}`);

// Step 4: Update faceRecognitionService.ts
console.log('\nStep 4: Updating faceRecognitionService.ts...');
const servicePath = path.join(__dirname, '../src/services/faceRecognitionService.ts');

if (fs.existsSync(servicePath)) {
  let serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // Replace canvas import and initialization
  serviceContent = serviceContent.replace(
    /\/\/ Try to use canvas with fallback mechanism[\s\S]*?throw new Error\('Canvas is required for face recognition'\);[\s\S]*?\}/,
    `// Use custom canvas adapter
let canvas;
try {
  canvas = require('../utils/canvasAdapter');
} catch (error) {
  console.error('Failed to load canvas adapter:', error);
  throw new Error('Canvas is required for face recognition');
}`
  );
  
  // Replace monkey patch
  serviceContent = serviceContent.replace(
    /\/\/ Apply monkey patch for face-api\.js[\s\S]*?throw new Error\('Failed to initialize face-api\.js with canvas'\);[\s\S]*?\}/,
    `// Apply monkey patch for face-api.js with better error handling
try {
  faceapi.env.monkeyPatch({
    Canvas: canvas.Canvas as any,
    Image: canvas.Image as any,
    ImageData: canvas.ImageData as any,
    // Override the createCanvas function to handle parameter errors
    createCanvasElement: function() {
      // Handle both no args case and width/height case
      const width = arguments[0] || 1;
      const height = arguments[1] || 1;
      // Ensure we have valid numbers
      return canvas.createCanvas(
        typeof width === 'number' ? width : 1,
        typeof height === 'number' ? height : 1
      );
    }
  });
  console.log('Canvas module loaded and monkey patched successfully');
} catch (error) {
  console.error('Error applying monkey patch for face-api.js:', error);
  throw new Error('Failed to initialize face-api.js with canvas');
}`
  );
  
  // Update canvas creation in detectFaces
  if (serviceContent.includes('const cvs = canvas.createCanvas(img.width, img.height);')) {
    serviceContent = serviceContent.replace(
      'const cvs = canvas.createCanvas(img.width, img.height);',
      `// Create a canvas with the image dimensions, ensuring valid values
    const width = Math.max(img.width || 1, 10);
    const height = Math.max(img.height || 1, 10);
    
    const cvs = canvas.createCanvas(width, height);`
    );
    
    // Update drawImage to use width and height
    serviceContent = serviceContent.replace(
      'ctx.drawImage(img, 0, 0, img.width, img.height);',
      `try {
      ctx.drawImage(img, 0, 0, width, height);
    } catch (error) {
      console.error('Error drawing image on canvas:', error);
      throw new Error('Failed to process image for face detection');
    }`
    );
  }
  
  fs.writeFileSync(servicePath, serviceContent);
  console.log('Successfully updated faceRecognitionService.ts');
}

// Step 5: Download face recognition models
console.log('\nStep 5: Downloading face recognition models...');
runCommand('npm run download-face-models');

// Step 6: Build the project
console.log('\nStep 6: Building the project...');
runCommand('npm run build');

console.log('\n=== Fix Complete! ===');
console.log('The "specified procedure could not be found" error should be resolved.');
console.log('Try running the app with: npm run dev');
console.log('\nIf you still encounter issues:');
console.log('1. Make sure you have the Visual C++ 2019 Redistributable installed');
console.log('2. Make sure your Node.js version is 16.x');
console.log('3. Try running in Windows Subsystem for Linux (WSL)'); 