import { Request, Response } from 'express';
import faceGroupService from '../services/faceGroupService';
import photoService from '../services/photoService';

export const getAllFaceGroups = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faceGroups = await faceGroupService.getAllFaceGroups();
    res.status(200).json(faceGroups);
  } catch (error) {
    console.error('Error getting face groups:', error);
    res.status(500).json({ error: 'Failed to get face groups' });
  }
};

// Get a single face group by ID
export const getFaceGroupById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const faceGroup = await faceGroupService.getFaceGroupById(id);
    
    if (!faceGroup) {
      res.status(404).json({ error: 'Face group not found' });
      return;
    }
    
    res.status(200).json(faceGroup);
  } catch (error) {
    console.error('Error getting face group:', error);
    res.status(500).json({ error: 'Failed to get face group' });
  }
};


export const updateFaceGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const faceGroupData = req.body;
    
    const updatedFaceGroup = await faceGroupService.updateFaceGroup(id, faceGroupData);
    
    if (!updatedFaceGroup) {
      res.status(404).json({ error: 'Face group not found' });
      return;
    }
    
    res.status(200).json(updatedFaceGroup);
  } catch (error) {
    console.error('Error updating face group:', error);
    res.status(500).json({ error: 'Failed to update face group' });
  }
};

export const deleteFaceGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Get the face group to check if it exists
    const faceGroup = await faceGroupService.getFaceGroupById(id);
    
    if (!faceGroup) {
      res.status(404).json({ error: 'Face group not found' });
      return;
    }
    
    
    const deleted = await faceGroupService.deleteFaceGroup(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Face group not found' });
      return;
    }
    
    res.status(200).json({ message: 'Face group deleted successfully' });
  } catch (error) {
    console.error('Error deleting face group:', error);
    res.status(500).json({ error: 'Failed to delete face group' });
  }
};


export const getPhotosByFaceGroupId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Getting photos for face group ID: ${id}`);
    
    // Check if the face group exists
    const faceGroup = await faceGroupService.getFaceGroupById(id);
    
    if (!faceGroup) {
      console.log(`Face group ${id} not found`);
      res.status(404).json({ error: 'Face group not found' });
      return;
    }
    
    console.log(`Face group ${id} found with ${faceGroup.photoIds.length} photoIds:`, faceGroup.photoIds);
    
  
    const photos = await photoService.getPhotosByFaceGroupId(id);
    console.log(`Retrieved ${photos.length} photos from photoService for face group ${id}:`);
    
    if (photos.length === 0 && faceGroup.photoIds.length > 0) {
      console.log(`Potential mismatch: Face group has photos IDs but none were found in the photo collection`);
      
      console.log(`Trying to fetch photos directly by their IDs: ${faceGroup.photoIds}`);
      const directPhotos = await Promise.all(
        faceGroup.photoIds.map(async (photoId) => {
          const photo = await photoService.getPhotoById(photoId);
          return photo;
        })
      );
      
      const validPhotos = directPhotos.filter(photo => photo !== null) as any[];
      console.log(`Retrieved ${validPhotos.length} photos directly by ID`);
      
      if (validPhotos.length > 0) {
        console.log(`Returning ${validPhotos.length} photos fetched directly`);
        res.status(200).json(validPhotos);
        return;
      }
    }
    
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error getting photos by face group ID:', error);
    res.status(500).json({ error: 'Failed to get photos by face group ID' });
  }
};

export default {
  getAllFaceGroups,
  getFaceGroupById,
  updateFaceGroup,
  deleteFaceGroup,
  getPhotosByFaceGroupId,
}; 