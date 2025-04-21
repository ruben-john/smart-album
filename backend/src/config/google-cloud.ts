import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import config from './env';

// Initialize Vision API client
const visionClient = new ImageAnnotatorClient({
  projectId: config.google.projectId,
});

// Initialize Firestore client
const firestore = new Firestore({
  projectId: config.google.projectId,
  ignoreUndefinedProperties: true,
});

// Initialize Storage client
const storage = new Storage({
  projectId: config.google.projectId,
});

// Get a reference to the storage bucket
const bucket = storage.bucket(config.storage.bucketName);

export {
  visionClient,
  firestore,
  storage,
  bucket,
}; 