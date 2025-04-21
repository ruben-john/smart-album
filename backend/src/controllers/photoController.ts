import { Request, Response } from 'express';
import photoService from '../services/photoService';
import storageService from '../services/storageService';
import visionService from '../services/visionService';
import sharp from 'sharp';
import { generateImageHash } from '../utils/imageHash';

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const fileBuffer = file.buffer;
    const imageInfo = await sharp(fileBuffer).metadata();
    
    const processedImageBuffer = await sharp(fileBuffer)
      .jpeg() // Convert to JPEG format which is well supported
      .toBuffer();
    
    // Generate image hash
    const imageHash = await generateImageHash(processedImageBuffer);
    
    // Upload the original file to Google Cloud Storage
    const { url: storageUrl, filename } = await storageService.uploadFile(
      fileBuffer,
      file.originalname,
      file.mimetype
    );
    
    const thumbnailUrl = await storageService.generateAndUploadThumbnail(
      fileBuffer,
      file.originalname
    );
    
    // Analyze the image using Google Cloud Vision API and face-api.js
    // Use the processed image buffer for better compatibility
    const analysisResult = await visionService.analyzeImage(processedImageBuffer);
    
    const photo = await photoService.createPhoto({
      fileName: filename,
      storageUrl,
      thumbnailUrl,
      imageHash,
      metadata: {
        width: imageInfo.width || 0,
        height: imageInfo.height || 0,
        format: imageInfo.format || 'unknown',
        createdAt: new Date(),
      },
      tags: analysisResult.tags,
      objects: analysisResult.objects,
      landmarks: analysisResult.landmarks,
      faces: analysisResult.faces,
      faceGroupIds: analysisResult.faceGroupIds,
    });
    
    res.status(201).json(photo);
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    if (error.message === 'Duplicate photo detected') {
      res.status(409).json({ error: 'This photo already exists in your album' });
    } else {
      res.status(500).json({ error: 'Failed to upload and process photo' });
    }
  }
};

export const getAllPhotos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const photos = await photoService.getAllPhotos();
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
};

export const getPhotoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(id);
    
    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    
    res.status(200).json(photo);
  } catch (error) {
    console.error('Error getting photo:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
};

export const updatePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const photoData = req.body;
    
    const updatedPhoto = await photoService.updatePhoto(id, photoData);
    
    if (!updatedPhoto) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    
    res.status(200).json(updatedPhoto);
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
};

export const deletePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Get the photo to delete its files
    const photo = await photoService.getPhotoById(id);
    
    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    
    // Delete the photo from Firestore
    const deleted = await photoService.deletePhoto(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    
    // Delete the original file and thumbnail from Google Cloud Storage
    if (photo.storageUrl) {
      await storageService.deleteFile(photo.storageUrl);
    }
    
    if (photo.thumbnailUrl) {
      await storageService.deleteFile(photo.thumbnailUrl);
    }
    
    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

export const searchPhotosByTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tags } = req.query;
    
    if (!tags || !Array.isArray(tags)) {
      res.status(400).json({ error: 'Tags must be provided as an array' });
      return;
    }
    
    const photos = await photoService.searchPhotosByTags(tags as string[]);
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error searching photos by tags:', error);
    res.status(500).json({ error: 'Failed to search photos by tags' });
  }
};

export const searchPhotosByObjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { objects } = req.query;
    
    if (!objects || !Array.isArray(objects)) {
      res.status(400).json({ error: 'Objects must be provided as an array' });
      return;
    }
    
    const photos = await photoService.searchPhotosByObjects(objects as string[]);
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error searching photos by objects:', error);
    res.status(500).json({ error: 'Failed to search photos by objects' });
  }
};

export const searchPhotosByLandmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Search landmarks request:", req.query);
    
    // Handle different formats of the landmarks parameter
    let landmarkTerms: string[] = [];
    
    if (Array.isArray(req.query.landmarks)) {
      landmarkTerms = req.query.landmarks as string[];
    } else if (typeof req.query.landmarks === 'string') {
      landmarkTerms = [req.query.landmarks];
    } else {
      res.status(400).json({ error: 'Landmarks must be provided as a string or an array' });
      return;
    }
    
    console.log("Searching for landmarks:", landmarkTerms);
    
    const photos = await photoService.searchPhotosByLandmarks(landmarkTerms);
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error searching photos by landmarks:', error);
    res.status(500).json({ error: 'Failed to search photos by landmarks' });
  }
};

export default {
  uploadPhoto,
  getAllPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  searchPhotosByTags,
  searchPhotosByObjects,
  searchPhotosByLandmarks,
}; 