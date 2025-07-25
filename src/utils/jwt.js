import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
