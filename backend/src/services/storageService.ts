import { bucket } from '../config/google-cloud';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sharp from 'sharp';

// Upload a file to Google Cloud Storage
export const uploadFile = async (
  fileBuffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<{ url: string; filename: string }> => {
  try {
    const fileExtension = path.extname(originalFilename);
    const filename = `${uuidv4()}${fileExtension}`;
    const file = bucket.file(`uploads/${filename}`);
    
    // Upload the file
    await file.save(fileBuffer, {
      contentType,
      metadata: {
        contentType,
        metadata: {
          originalFilename,
        },
      },
    });
    
    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    
    return { url, filename };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

// Generate and upload a thumbnail for an image
export const generateAndUploadThumbnail = async (
  imageBuffer: Buffer,
  originalFilename: string
): Promise<string> => {
  try {
    const fileExtension = path.extname(originalFilename);
    const filename = `${uuidv4()}_thumbnail${fileExtension}`;
    
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(300, 300, { fit: 'inside' })
      .toBuffer();
    
    const thumbnailFile = bucket.file(`thumbnails/${filename}`);
    
    // Upload the thumbnail
    await thumbnailFile.save(thumbnailBuffer, {
      contentType: 'image/jpeg',
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          originalFilename,
          isThumbnail: 'true',
        },
      },
    });
    
    const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailFile.name}`;
    
    return thumbnailUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

export const deleteFile = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(fileUrl);
    const filePath = urlObj.pathname.split('/').slice(2).join('/');
    
    const file = bucket.file(filePath);
    
    // Check if the file exists
    const [exists] = await file.exists();
    if (!exists) {
      return false;
    }
    
    // Delete the file
    await file.delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

export const uploadImage = async (file: Express.Multer.File): Promise<{ storageUrl: string; thumbnailUrl: string }> => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const thumbnailFileName = `thumbnail_${uniqueFileName}`;

  // Create a thumbnail
  const thumbnailBuffer = await sharp(file.buffer)
    .resize(300, 300, { fit: 'inside' })
    .toBuffer();

  // Upload original file
  const fileUpload = bucket.file(uniqueFileName);
  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  });

  // Upload thumbnail
  const thumbnailUpload = bucket.file(thumbnailFileName);
  await thumbnailUpload.save(thumbnailBuffer, {
    contentType: 'image/jpeg',
    public: true,
  });

  // Get public URLs
  const storageUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
  const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailFileName}`;

  return { storageUrl, thumbnailUrl };
};

export default {
  uploadFile,
  generateAndUploadThumbnail,
  deleteFile,
  uploadImage,
}; 