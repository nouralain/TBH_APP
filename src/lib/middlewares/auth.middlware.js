import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config.js';
import { findUserById } from '../repo/user.repo.js';

export const authenticate =async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error("No token provided", {cause:{status:401}});
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token,JWT_SECRET);
      const exist = await findUserById(decoded.id)
if(!exist)throw new Error("Not Authorized",{cause:{status:401}})

    req.user = decoded;
    next();
  } catch (err) {
    throw new Error("Invalid or expired token", {cause:{status:401}});
  }
};