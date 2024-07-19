import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  deleteChat,
  getChatDetailsFromAdmin,
  getChatFormUser,
  getNewestChatFromAdmin,
} from '../controllers/chat.controllers.js';

const router = Router();
router.use(json());
router.route('/api/users/chat').get(auth, getChatFormUser);
router.route('/api/chat_list/newest').get(auth, getNewestChatFromAdmin);
router
  .route('/api/chat/:senderId')
  .get(auth, getChatDetailsFromAdmin)
  .delete(auth, deleteChat);

export const router_chat = router;
