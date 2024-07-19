import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllFavorite,
  postFavorite,
} from '../controllers/favorite.controllers.js';

const router = Router();
router.use(json());
router
  .route('/api/favorite')
  .get(auth, getAllFavorite)
  .post(auth, postFavorite);

export const router_favorite = router;
