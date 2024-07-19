import { Router, json } from 'express';
import {
  changeRateProvince,
  getAllDistricts,
  getAllProvinces,
  getAllRateProvince,
  getDistrictsByProvince,
  getWadsByDistrict,
} from '../controllers/country.controllers.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(json());
router.route('/api/provinces/get_all').get(getAllProvinces);
router.route('/api/provinces/get_rate').get(auth, getAllRateProvince);
router.route('/api/provinces/:id').put(auth, changeRateProvince);
router.route('/api/districts/get_all').get(getAllDistricts);
router.route('/api/districts/getByProvince').get(getDistrictsByProvince);
router.route('/api/wards/getByDistrict').get(getWadsByDistrict);

export const router_country = router;
