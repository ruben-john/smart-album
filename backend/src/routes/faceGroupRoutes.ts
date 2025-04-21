import { Router } from 'express';
import faceGroupController from '../controllers/faceGroupController';

const router = Router();

// Routes
router.get('/', faceGroupController.getAllFaceGroups);
router.get('/:id', faceGroupController.getFaceGroupById);
router.put('/:id', faceGroupController.updateFaceGroup);
router.delete('/:id', faceGroupController.deleteFaceGroup);
router.get('/:id/photos', faceGroupController.getPhotosByFaceGroupId);

export default router; 