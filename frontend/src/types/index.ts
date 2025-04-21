export interface FaceData {
  faceId: string;
  boundingPoly: {
    vertices: Array<{ x: number; y: number }>;
  };
  faceGroupId?: string;
  faceDescriptor?: number[];
}

export interface PhotoMetadata {
  width: number;
  height: number;
  format: string;
  createdAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Photo {
  id: string;
  fileName: string;
  storageUrl: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  metadata: PhotoMetadata;
  tags: string[];
  objects: string[];
  landmarks: Array<{
    name: string;
    confidence: number;
    boundingPoly?: {
      vertices: Array<{ x: number; y: number }>;
    };
  }>;
  faces: FaceData[];
  faceGroupIds: string[];
}

export interface FaceGroup {
  id: string;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
  photoIds: string[];
  faceIds: string[];
  representativeFaceId?: string;
  averageDescriptor?: number[];
}

export interface SearchFilters {
  tags?: string[];
  objects?: string[];
  landmarks?: string[];
  faceGroupId?: string;
} 