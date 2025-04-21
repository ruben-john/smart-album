#!/usr/bin/env node

/**
 * This script generates image hashes for all existing photos in the database that don't have one
 * Run using: npm run generate-hashes
 */

import generateHashesForExistingPhotos from '../utils/generateHashesForExistingPhotos';

console.log('Starting hash generation process...');

generateHashesForExistingPhotos()
  .then(() => {
    console.log('Hash generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating hashes:', error);
    process.exit(1);
  }); 