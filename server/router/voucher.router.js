import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  checkVoucher,
  deleteVoucher,
  getAllVouchers,
  postVoucher,
  updateVoucher,
} from '../controllers/voucher.controllers.js';

const router = Router();
router.use(json());
router.route('/api/vouchers').get(auth, getAllVouchers).post(auth, postVoucher);
router.route('/api/vouchers/check_voucher').post(checkVoucher);
router
  .route('/api/vouchers/:sku')
  .put(auth, updateVoucher)
  .delete(auth, deleteVoucher);

export const router_voucher = router;
