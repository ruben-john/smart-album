/**
 * Utility script to generate image hashes for existing photos in the database
 * 
 * To run this script:
 * 1. Build the TypeScript files: npm run build
 * 2. Run the script: node dist/utils/generateHashesForExistingPhotos.js
 */

import { firestore } from '../config/google-cloud';
import { Photo } from '../models/Photo';
import fetch from 'node-fetch';
import { generateImageHash } from './imageHash';

export const generateHashesForExistingPhotos = async (): Promise<void> => {
  console.log('Starting hash generation for existing photos');
  
  // Get all photos without an imageHash
  const photosCollection = firestore.collection('photos');
  const snapshot = await photosCollection
    .where('imageHash', '==', null)
    .get();
  
  console.log(`Found ${snapshot.docs.length} photos in total`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const doc of snapshot.docs) {
    const photo = { id: doc.id, ...doc.data() } as Photo;
    
    // Skip photos that already have a hash
    if (photo.imageHash) {
      console.log(`Skipping photo ${photo.id} - already has hash`);
      skippedCount++;
      continue;
    }
    
    try {
      // Download the image
      console.log(`Processing photo ${photo.id} - ${photo.fileName}`);
      const response = await fetch(photo.storageUrl);
      
      if (!response.ok) {
        console.error(`Failed to download photo ${photo.id}: ${response.statusText}`);
        errorCount++;
        continue;
      }
      
      const buffer = await response.buffer();
      
      // Generate hash
      const imageHash = await generateImageHash(buffer);
      console.log(`Generated hash for photo ${photo.id}: ${imageHash}`);
      
      // Update the photo document
      await photosCollection.doc(photo.id).update({ imageHash });
      
      updatedCount++;
      console.log(`Updated photo ${photo.id} with hash`);
    } catch (error) {
      console.error(`Error processing photo ${photo.id}:`, error);
      errorCount++;
    }
  }
  
  console.log('\nHash generation complete!');
  console.log(`Updated: ${updatedCount} photos`);
  console.log(`Skipped: ${skippedCount} photos (already had hashes)`);
  console.log(`Errors: ${errorCount} photos`);
}

// Uncomment to run the script directly
// generateHashesForExistingPhotos()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error('Fatal error:', error);
//     process.exit(1);
//   });

export default generateHashesForExistingPhotos; 