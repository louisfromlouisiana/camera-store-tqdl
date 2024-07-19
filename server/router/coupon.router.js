import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { uploadImg } from '../middleware/uploadImage.js';
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from '../controllers/coupon.controllers.js';

const router = Router();
router.use(json());
router
  .route('/api/coupons')
  .get(getAllCoupons)
  .post(auth, uploadImg.single('images'), createCoupon);
router.route('/api/coupons/:id').delete(auth, deleteCoupon);

export const router_coupon = router;
