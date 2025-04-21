/**
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
};