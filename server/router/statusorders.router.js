import { Router, json } from 'express';
import { getStatusOrders } from '../controllers/statusorders.controllers.js';

const router = Router();
router.use(json());
router.route('/api/status_orders').get(getStatusOrders);

export const router_statusorders = router;
