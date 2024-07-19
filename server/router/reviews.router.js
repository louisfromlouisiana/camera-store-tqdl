import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getReviewsProducts,
  postReview,
} from '../controllers/reviews.controllers.js';
import { uploadImg } from '../middleware/uploadImage.js';

const router = Router();
router.use(json());
router.route('/api/reviews').post(auth, uploadImg.array('images'), postReview);
router.route('/api/reviews/:productId').get(getReviewsProducts);
export const router_reviews = router;
