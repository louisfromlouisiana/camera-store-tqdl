import jwt from 'jsonwebtoken';
import { blackList } from '../utils/blackList.js';
export const auth = async (req, res, next) => {
  const token = req.headers['authorization'];
  const getToken = token?.split(' ')[1];
  if (!getToken) {
    return res
      .status(401)
      .json({ error: true, success: false, message: 'Token not exist' });
  }

  if (blackList.has(getToken))
    return res.status(401).json({
      error: true,
      success: false,
      message: 'Token đã hết hạn hoặc không hợp lệ.',
    });
  // using json web token
  jwt.verify(getToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Token is not incorrect!',
      });
    }
    if (decoded) {
      req.decoded = decoded;
      next();
    }
  });
};
