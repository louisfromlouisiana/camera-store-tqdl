import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { uploadImg } from '../middleware/uploadImage.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/category.controllers.js';

const router = Router();
router.use(json());
router
  .route('/api/categories')
  .get(getCategories)
  .post(auth, uploadImg.single('images'), createCategory);
router
  .route('/api/categories/:id')
  .put(auth, uploadImg.single('images'), updateCategory)
  .delete(auth, deleteCategory);

export const router_category = router;
