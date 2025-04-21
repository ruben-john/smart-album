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

export interface FaceGroupCreateInput {
  label?: string;
  photoIds: string[];
  faceIds: string[];
  representativeFaceId?: string;
  averageDescriptor?: number[];
}

export default FaceGroup; 