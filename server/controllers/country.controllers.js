import { districtsModel } from '../models/districts.model.js';
import { provincesModel } from '../models/provinces.model.js';
import { wardsModel } from '../models/wards.model.js';
import diacritics from 'diacritics';
export const changeRateProvince = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  const { rate } = req.body;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    if (Number(rate) < 0)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Fee cannot be less than 0!',
      });
    const updatedProvince = await provincesModel.findByIdAndUpdate(id, {
      rate: rate,
    });
    if (updatedProvince)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Fee updated successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const getAllRateProvince = async (req, res) => {
  const user = req.decoded;
  const { search, page } = req.query;
  const curPage = page ? Number(page) : 1;
  let query = {};
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    if (search && search !== 'null' && search !== null) {
      const unaccentedQueryString = diacritics.remove(search);
      const regexSensitive = new RegExp(search, 'i');
      const regexInsensitive = new RegExp(unaccentedQueryString, 'i');

      query = {
        $or: [
          {
            name: regexSensitive,
          },
          {
            slug: regexInsensitive,
          },
          {
            code: regexInsensitive,
          },
        ],
      };
    }
    const totalData = await provincesModel.countDocuments(query);
    const data = await provincesModel
      .find(query).sort({name:1})
      .skip((curPage - 1) * 20)
      .limit(20);
    return res.status(200).json({
      error: false,
      success: true,
      data: data,
      totalPage: Math.ceil(totalData / 20),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const getAllProvinces = async (req, res) => {
  try {
    const provinces = await provincesModel.find().sort({slug: 1}).lean();
    return res.status(200).json(provinces !== null ? provinces : []);
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
// const getRateProvinces = async (req, res) => {
//   const { code } = req.params;
//   try {
//     const province = await provincesModel.findOne({ code: code }).lean();
//     return res.status(200).json(province);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
export const getAllDistricts = async (req, res) => {
  try {
    const districts = await districtsModel.find().sort({slug: 1}).lean();
    return res.status(200).json(districts !== null ? districts : []);
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getDistrictsByProvince = async (req, res) => {
  const { provinceCode } = req.query;
  try {
    const districts = await districtsModel.find({
      parent_code: provinceCode,
    }).sort({slug: 1});
    return res.status(200).json(districts !== null ? districts : []);
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getWadsByDistrict = async (req, res) => {
  const { districtCode } = req.query;

  try {
    const wards = await wardsModel.find({ parent_code: districtCode }).sort({slug: 1}).lean();
    return res.status(200).json(wards !== null ? wards : []);
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
