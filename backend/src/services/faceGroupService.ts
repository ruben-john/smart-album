import { firestore } from '../config/google-cloud';
import { FaceGroup, FaceGroupCreateInput } from '../models/FaceGroup';
import { FaceData } from '../models/Photo';
import config from '../config/env';

const faceGroupsCollection = firestore.collection('faceGroups');

export const createFaceGroup = async (faceGroupData: FaceGroupCreateInput): Promise<FaceGroup> => {
  const faceGroupDoc = faceGroupsCollection.doc();
  
  const faceGroup: FaceGroup = {
    id: faceGroupDoc.id,
    label: faceGroupData.label || 'Unknown Person',
    createdAt: new Date(),
    updatedAt: new Date(),
    photoIds: faceGroupData.photoIds || [],
    faceIds: faceGroupData.faceIds || [],
    representativeFaceId: faceGroupData.representativeFaceId,
    averageDescriptor: faceGroupData.averageDescriptor,
  };

  await faceGroupDoc.set(faceGroup);
  return faceGroup;
};

export const getFaceGroupById = async (id: string): Promise<FaceGroup | null> => {
  const faceGroupDoc = await faceGroupsCollection.doc(id).get();
  
  if (!faceGroupDoc.exists) {
    return null;
  }
  
  return { id: faceGroupDoc.id, ...faceGroupDoc.data() } as FaceGroup;
};

export const getAllFaceGroups = async (): Promise<FaceGroup[]> => {
  const snapshot = await faceGroupsCollection.orderBy('updatedAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FaceGroup));
};

export const updateFaceGroup = async (id: string, faceGroupData: Partial<FaceGroup>): Promise<FaceGroup | null> => {
  const faceGroupDoc = faceGroupsCollection.doc(id);
  const faceGroupSnapshot = await faceGroupDoc.get();
  
  if (!faceGroupSnapshot.exists) {
    return null;
  }
  
  await faceGroupDoc.update({
    ...faceGroupData,
    updatedAt: new Date(),
  });
  
  const updatedFaceGroupSnapshot = await faceGroupDoc.get();
  return { id: updatedFaceGroupSnapshot.id, ...updatedFaceGroupSnapshot.data() } as FaceGroup;
};

export const deleteFaceGroup = async (id: string): Promise<boolean> => {
  const faceGroupDoc = faceGroupsCollection.doc(id);
  const faceGroupSnapshot = await faceGroupDoc.get();
  
  if (!faceGroupSnapshot.exists) {
    return false;
  }
  
  await faceGroupDoc.delete();
  return true;
};

// Helper function to calculate Euclidean distance between face descriptors
const calculateDistance = (descriptor1: number[], descriptor2: number[]): number => {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Face descriptors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  
  return Math.sqrt(sum);
};

// Find the best matching face group for a face, or return null if no match
export const findMatchingFaceGroup = async (faceDescriptor: number[]): Promise<FaceGroup | null> => {
  const faceGroups = await getAllFaceGroups();
  
  let bestMatch: FaceGroup | null = null;
  let bestDistance = Infinity;
  
  for (const faceGroup of faceGroups) {
    if (faceGroup.averageDescriptor) {
      const distance = calculateDistance(faceDescriptor, faceGroup.averageDescriptor);
      
      if (distance < config.faceDetection.similarityThreshold && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = faceGroup;
      }
    }
  }
  
  return bestMatch;
};

// Calculate average descriptor for a face group
export const calculateAverageDescriptor = (faces: FaceData[]): number[] | undefined => {
  const descriptors = faces
    .filter(face => face.faceDescriptor && face.faceDescriptor.length > 0)
    .map(face => face.faceDescriptor!);
  
  if (descriptors.length === 0) {
    return undefined;
  }
  
  const length = descriptors[0].length;
  const average = new Array(length).fill(0);
  
  for (const descriptor of descriptors) {
    for (let i = 0; i < length; i++) {
      average[i] += descriptor[i] / descriptors.length;
    }
  }
  
  return average;
};

export default {
  createFaceGroup,
  getFaceGroupById,
  getAllFaceGroups,
  updateFaceGroup,
  deleteFaceGroup,
  findMatchingFaceGroup,
  calculateAverageDescriptor,
}; 