import { v4 as uuidv4 } from 'uuid';
import { visionClient } from '../config/google-cloud';
import { FaceData } from '../models/Photo';
import faceGroupService from './faceGroupService';
import faceRecognitionService from './faceRecognitionService';

interface AnalysisResult {
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
  tags: string[];
}

export const analyzeImage = async (imageBuffer: Buffer): Promise<AnalysisResult> => {
  try {
    // Perform multiple detection types in a single request for object and landmark detection
    const [result] = await visionClient.annotateImage({
      image: { content: imageBuffer.toString('base64') },
      features: [
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'LANDMARK_DETECTION' },
        { type: 'LABEL_DETECTION' },
      ],
    });

    // Extract objects
    const objects = result.localizedObjectAnnotations?.map(obj => obj.name?.toLowerCase() || '') || [];
    
    // Extract landmarks
    const landmarks = result.landmarkAnnotations?.map(landmark => ({
      name: landmark.description?.toLowerCase() || '',
      confidence: landmark.score || 0,
      boundingPoly: landmark.boundingPoly ? {
        vertices: (landmark.boundingPoly.vertices || []).map(vertex => ({
          x: vertex.x || 0,
          y: vertex.y || 0
        }))
      } : undefined,
    })) || [];
    
    console.log("Detected landmarks:", landmarks.map(l => `${l.name} (${l.confidence})`));
    
    // Extract labels as tags
    const tags = result.labelAnnotations?.map(label => label.description?.toLowerCase() || '') || [];
    
    const faces = await faceRecognitionService.detectFaces(imageBuffer);
    
    const faceGroupIds: string[] = [];
    
    // For each face, find or create a face group
    for (const face of faces) {
      if (face.faceDescriptor) {
        // Try to find a matching face group
        const matchingFaceGroup = await faceGroupService.findMatchingFaceGroup(face.faceDescriptor);
        
        if (matchingFaceGroup) {
          // Add face to existing group
          face.faceGroupId = matchingFaceGroup.id;
          faceGroupIds.push(matchingFaceGroup.id);
          
          // Update the face group with the new face
          await faceGroupService.updateFaceGroup(matchingFaceGroup.id, {
            faceIds: [...matchingFaceGroup.faceIds, face.faceId],
            // Recalculate average descriptor
            averageDescriptor: faceGroupService.calculateAverageDescriptor([
              ...matchingFaceGroup.faceIds.map(id => ({ faceId: id, faceDescriptor: face.faceDescriptor } as FaceData)),
              face,
            ]),
          });
        } else {
          // Create a new face group
          const newFaceGroup = await faceGroupService.createFaceGroup({
            faceIds: [face.faceId],
            photoIds: [], // Will be updated after photo is created
            representativeFaceId: face.faceId,
            averageDescriptor: face.faceDescriptor,
          });
          
          face.faceGroupId = newFaceGroup.id;
          faceGroupIds.push(newFaceGroup.id);
        }
      }
    }
    
    // Combine all tags - ensure landmarks are included
    const allTags = [
      ...new Set([
        ...tags,
        ...objects,
        ...landmarks.map(l => l.name), // Ensure landmark names are included in tags
      ]),
    ].filter(Boolean);
    
    console.log("Combined tags:", allTags);
    
    return {
      objects,
      landmarks,
      faces,
      faceGroupIds,
      tags: allTags,
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
};

export const detectLabels = async (imageBuffer: Buffer): Promise<string[]> => {
  try {
    const [result] = await visionClient.labelDetection(imageBuffer);
    const labels = result.labelAnnotations || [];
    
    return labels
      .filter(label => label.score && label.score >= 0.7)
      .map(label => label.description || '')
      .filter(label => label !== '');
  } catch (error) {
    console.error('Error detecting labels:', error);
    return [];
  }
};

export default {
  analyzeImage,
  detectLabels,
}; 