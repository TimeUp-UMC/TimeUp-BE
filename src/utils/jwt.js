import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const generateMasterAccessToken = (user) => {
  return jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '14d',
  });
};
