import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createProduct,
  deleteProduct,
  getProductDetails,
  getProducts,
  updateProduct,
} from '../controllers/product.controllers.js';
import { uploadImg } from '../middleware/uploadImage.js';

const router = Router();
router.use(json());
router
  .route('/api/products')
  .get(getProducts)
  .post(auth, uploadImg.array('images'), createProduct);
router
  .route('/api/products/:id')
  .get(getProductDetails)
  .put(auth, uploadImg.array('images'), updateProduct)
  .delete(auth, deleteProduct);

export const router_product = router;
