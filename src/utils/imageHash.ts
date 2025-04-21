import { encode } from "blurhash";

export async function generateImageHash(imageData: ArrayBuffer): Promise<string> {
  // Convert ArrayBuffer to ImageData
  const img = new Image();
  const blob = new Blob([imageData]);
  const imageUrl = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      // Generate blurhash
      const hash = encode(
        imageData.data,
        imageData.width,
        imageData.height,
        4,  // horizontal components
        4   // vertical components
      );
      
      URL.revokeObjectURL(imageUrl);
      resolve(hash);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
} 