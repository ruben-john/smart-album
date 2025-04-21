import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';

// Removed duplicate declarations that were causing conflicts

// Additional type definitions for service files
declare module '../services/photoService' {
  export interface Photo {
    id: string;
    fileName: string;
    storageUrl: string;
    thumbnailUrl?: string;
    imageHash?: string;
    uploadedAt: Date;
    metadata?: {
      width?: number;
      height?: number;
      format?: string;
    };
    tags?: string[];
    objects?: string[];
    landmarks?: Array<{
      name: string;
      confidence: number;
    }>;
    faces?: Array<{
      faceId: string;
      boundingPoly: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
      faceDescriptor?: number[];
    }>;
    faceGroupIds?: string[];
  }

  export interface PhotoCreateInput {
    fileName: string;
    storageUrl: string;
    thumbnailUrl?: string;
    imageHash?: string;
    metadata?: {
      width?: number;
      height?: number;
      format?: string;
    };
    tags?: string[];
    objects?: string[];
    landmarks?: Array<{
      name: string;
      confidence: number;
    }>;
    faces?: Array<{
      faceId: string;
      boundingPoly: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
      faceDescriptor?: number[];
    }>;
    faceGroupIds?: string[];
  }
} 