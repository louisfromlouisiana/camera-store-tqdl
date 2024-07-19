import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { uploadImg } from '../middleware/uploadImage.js';
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from '../controllers/banner.controllers.js';

const router = Router();
router.use(json());
router
  .route('/api/banners')
  .get(getBanners)
  .post(auth, uploadImg.single('images'), createBanner);
router
  .route('/api/banners/:id')
  .put(auth, uploadImg.single('images'), updateBanner)
  .delete(auth, deleteBanner);

export const router_banner = router;
