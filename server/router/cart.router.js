import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  deleteProductFromCart,
  getCart,
  postCart,
} from '../controllers/cart.controllers.js';

const router = Router();
router.use(json());
router.route('/api/cart').get(auth, getCart).post(auth, postCart);
router.route('/api/cart/:id').delete(auth, deleteProductFromCart);

export const router_cart = router;
