import { Router } from 'express';
import { uploadImages } from '../controllers/uploadController';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.post('/', protect, adminOnly, upload.array('images', 6), uploadImages);
export default router;
