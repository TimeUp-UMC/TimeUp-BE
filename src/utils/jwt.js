import { sign } from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user) => {
  return sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
