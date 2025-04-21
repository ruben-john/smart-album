import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  google: {
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  },
  storage: {
    bucketName: process.env.STORAGE_BUCKET_NAME || '',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },
  faceDetection: {
    similarityThreshold: parseFloat(process.env.FACE_SIMILARITY_THRESHOLD || '0.6'),
  },
};

// Validate required configuration
const validateConfig = () => {
  const requiredVars = [
    { key: 'google.projectId', value: config.google.projectId },
    { key: 'storage.bucketName', value: config.storage.bucketName },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.map(({ key }) => key).join(', ')}`
    );
  }
};

// Call validation function
validateConfig();

export default config; 