import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllUserEmails,
  getUserEmailDetails,
  postUserEmail,
  replyEmailFromUser,
} from '../controllers/useremails.controller.js';

const router = Router();
router.use(json());
router.route('/api/email').get(auth, getAllUserEmails).post(postUserEmail);
router.route('/api/email/:id').get(auth, getUserEmailDetails);
router.route('/api/reply_email').post(auth, replyEmailFromUser);

export const router_useremails = router;
