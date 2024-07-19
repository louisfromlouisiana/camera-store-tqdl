import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createAddress,
  deleteAddress,
  getAddressFormUser,
  getAddressFromAdmin,
  getDefaultAddress,
  updateAddress,
} from '../controllers/useraddress.controllers.js';

const router = Router();
router.use(json());
router
  .route('/api/users_address/get_from_admin')
  .get(auth, getAddressFromAdmin);
router.route('/api/users_address/default_address').get(auth, getDefaultAddress);
router
  .route('/api/users_address')
  .get(auth, getAddressFormUser)
  .post(auth, createAddress);

router
  .route('/api/users_address/:id')
  .put(auth, updateAddress)
  .delete(auth, deleteAddress);
export const router_useraddress = router;
