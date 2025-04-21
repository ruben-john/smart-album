const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, '../models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Model files to download
const modelFiles = [
  'face_detection_model-weights_manifest.json',
  'face_detection_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2'
];

// Base URL for face-api.js weights
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Download a file
const downloadFile = (file) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, file);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File ${file} already exists, skipping...`);
      return resolve();
    }
    
    console.log(`Downloading ${file}...`);
    
    const fileStream = fs.createWriteStream(filePath);
    https.get(`${baseUrl}/${file}`, (response) => {
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${file}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if download failed
      reject(err);
    });
  });
};

// Download all models
const downloadAllModels = async () => {
  console.log('Downloading face-api.js model files...');
  
  try {
    // Download files sequentially
    for (const file of modelFiles) {
      await downloadFile(file);
    }
    
    console.log('All model files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading model files:', error);
    process.exit(1);
  }
};

downloadAllModels(); 