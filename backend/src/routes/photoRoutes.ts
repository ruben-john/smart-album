import { Router } from 'express';
import multer from 'multer';
import photoController from '../controllers/photoController';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Routes
router.post('/', upload.single('photo'), photoController.uploadPhoto);
router.get('/', photoController.getAllPhotos);
router.get('/:id', photoController.getPhotoById);
router.put('/:id', photoController.updatePhoto);
router.delete('/:id', photoController.deletePhoto);

// Search routes
router.get('/search/tags', photoController.searchPhotosByTags);
router.get('/search/objects', photoController.searchPhotosByObjects);
router.get('/search/landmarks', photoController.searchPhotosByLandmarks);

export default router; 