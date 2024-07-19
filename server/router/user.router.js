import { Router, json } from 'express';
import {
  banUser,
  changePassword,
  disBanUser,
  forgotPassword,
  getListUserByAdmin,
  getUserByToken,
  resendCode,
  updateUser,
  userLogin,
  userLogout,
  userRegister,
  validateResetPassword,
  verifiedEmail,
} from '../controllers/user.controllers.js';
import { auth } from '../middleware/auth.js';
import { uploadImg } from '../middleware/uploadImage.js';

const router = Router();
router.use(json());
router.route('/api/get_user').get(auth, getUserByToken);
router.route('/api/sign_in').post(userLogin);
router.route('/api/sign_up').post(userRegister);
router.route('/api/sign_out').post(userLogout);
router.route('/api/forgot_password').post(forgotPassword);
router.route('/api/resend_code').post(auth, resendCode);
router.route('/api/verified').post(auth, verifiedEmail);
router.route('/api/forgot_password').post(forgotPassword);
router.route('/api/change_password').post(auth, changePassword);
router.route('/api/reset_password/:token').get(validateResetPassword);
router
  .route('/api/users/:id')
  .put(auth, uploadImg.single('images'), updateUser);
router.route('/api/users/get_by_admin').get(auth, getListUserByAdmin);
router.route('/api/users/ban/:id').post(auth, banUser);
router.route('/api/users/dis_ban/:id').post(auth, disBanUser);
export const router_user = router;
