import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createPaymentVNPAY,
  createPaymentCOD,
  getOrderDetails,
  getOrderFormAdmin,
  getOrdersFromUser,
  queryDrVnpay,
  updateOrderByAdmin,
  updateOrderByUser,
} from '../controllers/order.controllers.js';

const router = Router();
router.use(json());
router.route('/api/create_payment/cod').post(auth, createPaymentCOD);
router.route('/api/create_payment/vnpay').post(auth, createPaymentVNPAY);
router.route('/api/vnpay/querydr').get(auth, queryDrVnpay);
router.route('/api/orders/:orderId').get(auth, getOrderDetails);
router.route('/api/users/orders/:orderId').put(auth, updateOrderByUser);
router.route('/api/users/orders').get(auth, getOrdersFromUser);
router.route('/api/admin/orders/:orderId').put(auth, updateOrderByAdmin);
router.route('/api/admin/orders').get(auth, getOrderFormAdmin);

export const router_orders = router;
