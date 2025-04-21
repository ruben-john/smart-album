import * as faceapi from 'face-api.js';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FaceData } from '../models/Photo';
import config from '../config/env';

// Use custom canvas adapter
let canvas;
try {
  canvas = require('../utils/canvasAdapter');
} catch (error) {
  console.error('Failed to load canvas adapter:', error);
  throw new Error('Canvas is required for face recognition');
}

// Apply monkey patch for face-api.js with better error handling
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
}

// Path to model files
const MODEL_URL = path.resolve(__dirname, '../../models');

// Flag to track if models are loaded
let modelsLoaded = false;

// Function to download model files if they don't exist
const downloadModelFiles = async () => {
  // Ensure models directory exists
  if (!fs.existsSync(MODEL_URL)) {
    fs.mkdirSync(MODEL_URL, { recursive: true });
  }

  const modelFiles = [
    'face_detection_model-weights_manifest.json',
    'face_detection_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2'
  ];

  // Check if model files exist
  const missingFiles = modelFiles.filter(file => 
    !fs.existsSync(path.join(MODEL_URL, file))
  );

  if (missingFiles.length > 0) {
    console.log('Some face-api.js model files are missing:');
    missingFiles.forEach(file => console.log(`- ${file}`));
    console.log('Please run: npm run download-face-models');
    throw new Error('Face recognition model files are missing');
  }
  
  return true;
};

// Load face detection models
export const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    await downloadModelFiles();
    
    // Load face detection models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    
    console.log('Face API models loaded successfully');
    modelsLoaded = true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
};

// Detect faces in image
export const detectFaces = async (imageBuffer: Buffer): Promise<FaceData[]> => {
  try {
    if (!modelsLoaded) {
      await loadModels();
    }
    
    // Convert buffer to base64 for canvas
    const base64Image = imageBuffer.toString('base64');
    const dataURL = `data:image/jpeg;base64,${base64Image}`;
    
    // Load image using canvas with better error handling
    const img = await canvas.loadImage(dataURL).catch((err: Error) => {
      console.error('Error loading image:', err);
      throw new Error('Failed to load image for face detection');
    });
    
    // Create a canvas with the image dimensions, ensuring valid values
    const width = Math.max(img.width || 1, 10);
    const height = Math.max(img.height || 1, 10);
    
    const cvs = canvas.createCanvas(width, height);
    const ctx = cvs.getContext('2d');
    
    try {
      ctx.drawImage(img, 0, 0, width, height);
    } catch (error) {
      console.error('Error drawing image on canvas:', error);
      throw new Error('Failed to process image for face detection');
    }
    
    // Detect all faces with landmarks and descriptors
    try {
      const detections = await faceapi.detectAllFaces(cvs)
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      console.log(`Detected ${detections.length} faces in image`);
      
      // Transform to FaceData format
      const faces: FaceData[] = detections.map(detection => {
        const { detection: { box }, descriptor } = detection;
        
        // Create bounding polygon from detection box
        const boundingPoly = {
          vertices: [
            { x: box.x, y: box.y },
            { x: box.x + box.width, y: box.y },
            { x: box.x + box.width, y: box.y + box.height },
            { x: box.x, y: box.y + box.height }
          ]
        };
        
        // Convert descriptor from Float32Array to regular array
        const faceDescriptor = Array.from(descriptor);
        
        return {
          faceId: uuidv4(),
          boundingPoly,
          faceDescriptor
        };
      });
      
      return faces;
    } catch (error) {
      console.error('Error during face detection:', error);
      throw new Error('Face detection algorithm failed');
    }
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw new Error('Failed to detect faces in image');
  }
};

// Calculate Euclidean distance between two face descriptors
export const calculateDistance = (descriptor1: number[], descriptor2: number[]): number => {
  try {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
      return Infinity;
    }
    
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    
    return Math.sqrt(sum);
  } catch (error) {
    console.error('Error calculating face distance:', error);
    return Infinity;
  }
};

// Find the best match for a face from a collection of face groups
export const findBestMatch = (faceDescriptor: number[], faceGroups: any[]): any => {
  try {
    if (!faceDescriptor || !faceGroups || !Array.isArray(faceGroups)) {
      return null;
    }

    let bestMatch = null;
    let bestDistance = Infinity;
    
    for (const group of faceGroups) {
      if (group && group.averageDescriptor) {
        const distance = calculateDistance(faceDescriptor, group.averageDescriptor);
        
        // If the distance is less than our threshold and better than previous best match
        if (distance < config.faceDetection.similarityThreshold && distance < bestDistance) {
          bestDistance = distance;
          bestMatch = group;
        }
      }
    }
    
    return bestMatch;
  } catch (error) {
    console.error('Error finding best face match:', error);
    return null;
  }
};

// Calculate average descriptor for a group of faces
export const calculateAverageDescriptor = (descriptors: number[][]): number[] => {
  try {
    if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
      return [];
    }
    
    const length = descriptors[0].length;
    const average = new Array(length).fill(0);
    
    for (const descriptor of descriptors) {
      if (descriptor && descriptor.length === length) {
        for (let i = 0; i < length; i++) {
          average[i] += descriptor[i] / descriptors.length;
        }
      }
    }
    
    return average;
  } catch (error) {
    console.error('Error calculating average descriptor:', error);
    return [];
  }
};

export default {
  loadModels,
  detectFaces,
  calculateDistance,
  findBestMatch,
  calculateAverageDescriptor
}; 