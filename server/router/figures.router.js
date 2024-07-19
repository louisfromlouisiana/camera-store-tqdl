import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { getFigures } from '../controllers/figures.controllers.js';

const router = Router();
router.use(json());
router.route('/api/figures').get(auth, getFigures);

export const router_figures = router;
