import { firestore } from '../config/google-cloud';
import { Photo, PhotoCreateInput } from '../models/Photo';
import faceGroupService from './faceGroupService';

const photosCollection = firestore.collection('photos');

// Function to check for duplicate photos
const checkForDuplicatePhoto = async (imageHash: string): Promise<Photo | null> => {
  const snapshot = await photosCollection
    .where('imageHash', '==', imageHash)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Photo;
  }
  return null;
};

export const createPhoto = async (photoData: PhotoCreateInput): Promise<Photo> => {
  // Check for duplicate photo
  const duplicatePhoto = await checkForDuplicatePhoto(photoData.imageHash);
  if (duplicatePhoto) {
    throw new Error('Duplicate photo detected');
  }

  const photoDoc = photosCollection.doc();
  
  const photo: Photo = {
    id: photoDoc.id,
    fileName: photoData.fileName,
    storageUrl: photoData.storageUrl,
    thumbnailUrl: photoData.thumbnailUrl,
    imageHash: photoData.imageHash,
    uploadedAt: new Date(),
    metadata: photoData.metadata,
    tags: photoData.tags,
    objects: photoData.objects,
    landmarks: photoData.landmarks,
    faces: photoData.faces,
    faceGroupIds: photoData.faceGroupIds,
  };

  await photoDoc.set(photo);
  
  // Update the face groups with the photo ID
  if (photo.faceGroupIds && photo.faceGroupIds.length > 0) {
    console.log(`Updating ${photo.faceGroupIds.length} face groups with photo ID: ${photo.id}`);
    
    // Update each face group's photoIds array
    for (const faceGroupId of photo.faceGroupIds) {
      try {
        const faceGroup = await faceGroupService.getFaceGroupById(faceGroupId);
        if (faceGroup) {
          // Add the photo ID to the face group's photoIds array if it's not already there
          if (!faceGroup.photoIds.includes(photo.id)) {
            await faceGroupService.updateFaceGroup(faceGroupId, {
              photoIds: [...faceGroup.photoIds, photo.id],
            });
            console.log(`Face group ${faceGroupId} updated with photo ID: ${photo.id}`);
          }
        }
      } catch (error) {
        console.error(`Error updating face group ${faceGroupId}:`, error);
      }
    }
  }
  
  return photo;
};

export const getPhotoById = async (id: string): Promise<Photo | null> => {
  const photoDoc = await photosCollection.doc(id).get();
  
  if (!photoDoc.exists) {
    return null;
  }
  
  return { id: photoDoc.id, ...photoDoc.data() } as Photo;
};

export const getAllPhotos = async (): Promise<Photo[]> => {
  const snapshot = await photosCollection.orderBy('uploadedAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
};

export const updatePhoto = async (id: string, photoData: Partial<Photo>): Promise<Photo | null> => {
  const photoDoc = photosCollection.doc(id);
  const photoSnapshot = await photoDoc.get();
  
  if (!photoSnapshot.exists) {
    return null;
  }
  
  await photoDoc.update({
    ...photoData,
    updatedAt: new Date(),
  });
  
  const updatedPhotoSnapshot = await photoDoc.get();
  return { id: updatedPhotoSnapshot.id, ...updatedPhotoSnapshot.data() } as Photo;
};

export const deletePhoto = async (id: string): Promise<boolean> => {
  const photoDoc = photosCollection.doc(id);
  const photoSnapshot = await photoDoc.get();
  
  if (!photoSnapshot.exists) {
    return false;
  }
  
  await photoDoc.delete();
  return true;
};

export const searchPhotosByTags = async (tags: string[]): Promise<Photo[]> => {
  if (!tags.length) {
    return [];
  }
  
  const snapshot = await photosCollection
    .where('tags', 'array-contains-any', tags)
    .orderBy('uploadedAt', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
};

export const searchPhotosByObjects = async (objects: string[]): Promise<Photo[]> => {
  if (!objects.length) {
    return [];
  }
  
  const snapshot = await photosCollection
    .where('objects', 'array-contains-any', objects)
    .orderBy('uploadedAt', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
};

export const searchPhotosByLandmarks = async (landmarks: string[]): Promise<Photo[]> => {
  if (!landmarks.length) {
    return [];
  }
  
  console.log("Searching for landmarks:", landmarks);
  
  try {
    const snapshot = await photosCollection.get();
    
    if (snapshot.empty) {
      console.log("Photos collection is empty");
      return [];
    }
    
    const allPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
    
    console.log("Total photos in database:", allPhotos.length);
    
    // Search in both landmarks and tags
    const results = allPhotos.filter(photo => {
      // Check landmarks
      const landmarkMatch = photo.landmarks && photo.landmarks.some(landmark => 
        landmarks.some(searchTerm => 
          landmark.name && landmark.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      // Check tags (as a fallback)
      const tagMatch = photo.tags && photo.tags.some(tag => 
        landmarks.some(searchTerm => 
          tag && tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      return landmarkMatch || tagMatch;
    });
    
    console.log("Found matching photos:", results.length);
    return results;
  } catch (error) {
    console.error("Error searching photos by landmarks:", error);
    return [];
  }
};

export const getPhotosByFaceGroupId = async (faceGroupId: string): Promise<Photo[]> => {
  console.log(`PhotoService: Querying photos with faceGroupId: ${faceGroupId}`);
  
  try {
    const snapshot = await photosCollection
      .where('faceGroupIds', 'array-contains', faceGroupId)
      .orderBy('uploadedAt', 'desc')
      .get();
    
    console.log(`PhotoService: Found ${snapshot.docs.length} photos for faceGroupId: ${faceGroupId}`);
    
    if (snapshot.docs.length === 0) {
      // Check if the faceGroupIds array field exists in any documents
      const allPhotos = await photosCollection.get();
      console.log(`PhotoService: Total photos in collection: ${allPhotos.docs.length}`);
      
      let photosWithFaceGroupIdsField = 0;
      let photosWithThisFaceGroupId = 0;
      
      allPhotos.docs.forEach(doc => {
        const data = doc.data();
        if (data.faceGroupIds) {
          photosWithFaceGroupIdsField++;
          if (Array.isArray(data.faceGroupIds) && data.faceGroupIds.includes(faceGroupId)) {
            photosWithThisFaceGroupId++;
            console.log(`PhotoService: Found photo ${doc.id} with matching faceGroupId but it wasn't returned in the query`);
          }
        }
      });
      
      console.log(`PhotoService: ${photosWithFaceGroupIdsField} photos have faceGroupIds field`);
      console.log(`PhotoService: ${photosWithThisFaceGroupId} photos have this specific faceGroupId`);
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
  } catch (error) {
    console.error(`PhotoService: Error getting photos by faceGroupId ${faceGroupId}:`, error);
    return [];
  }
};

export const initializeCollections = async (): Promise<void> => {
  try {
    // Check if photos collection exists, if not create it with a dummy document
    const photosSnapshot = await photosCollection.limit(1).get();
    if (photosSnapshot.empty) {
      console.log("Initializing photos collection...");
      await photosCollection.doc('sample').set({
        id: 'sample',
        fileName: 'sample.jpg',
        storageUrl: '',
        uploadedAt: new Date(),
        metadata: { width: 0, height: 0, format: 'jpg' },
        tags: [],
        objects: [],
        landmarks: [],
        faces: [],
        faceGroupIds: []
      });
      // Delete it immediately to avoid polluting your database
      await photosCollection.doc('sample').delete();
    }
    
    // Similarly for face groups collection
    const faceGroupsCollection = firestore.collection('faceGroups');
    const faceGroupsSnapshot = await faceGroupsCollection.limit(1).get();
    if (faceGroupsSnapshot.empty) {
      console.log("Initializing faceGroups collection...");
      await faceGroupsCollection.doc('sample').set({
        id: 'sample',
        createdAt: new Date(),
        updatedAt: new Date(),
        photoIds: [],
        faceIds: []
      });
      // Delete it immediately
      await faceGroupsCollection.doc('sample').delete();
    }
    
    console.log("Collections initialized successfully");
  } catch (error) {
    console.error("Error initializing collections:", error);
    throw error;
  }
};

export default {
  createPhoto,
  getPhotoById,
  getAllPhotos,
  updatePhoto,
  deletePhoto,
  searchPhotosByTags,
  searchPhotosByObjects,
  searchPhotosByLandmarks,
  getPhotosByFaceGroupId,
  initializeCollections,
}; 