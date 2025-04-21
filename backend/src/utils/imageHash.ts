import sharp from 'sharp';
import crypto from 'crypto';

export async function generateImageHash(imageBuffer: Buffer): Promise<string> {
  try {
    // Resize image to a small size (8x8) and convert to grayscale
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(8, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    // Calculate average pixel value
    const pixelValues = Array.from(new Uint8Array(resizedImageBuffer));
    const average = pixelValues.reduce((sum, val) => sum + val, 0) / pixelValues.length;

    // Create binary hash based on whether each pixel is above or below average
    const binaryHash = pixelValues
      .map((val) => val > average ? '1' : '0')
      .join('');

    // Convert binary to hexadecimal for storage
    const hexHash = parseInt(binaryHash, 2).toString(16).padStart(16, '0');

    return hexHash;
  } catch (error) {
    console.error('Error generating image hash:', error);
    throw new Error('Failed to generate image hash');
  }
} 