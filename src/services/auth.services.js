import * as userRespository from '../repositories/auth.repositories.js';
import { getGoogleUserInfo } from '../utils/googleAuth.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import redis from '../redis.config.js';
import { NotFoundError, ValidationError } from '../errors/error.js';
import jwt from 'jsonwebtoken';

export const handleGoogleLogin = async ({
  googleAccessToken,
  googleRefreshToken,
}) => {
  const googleProfile = await getGoogleUserInfo(googleAccessToken);

  console.log(googleProfile);
  const email = googleProfile.email;
  const name = googleProfile.name;
  const googleId = googleProfile.sub;

  if (!email || !name) {
    throw new ValidationError();
  }

  let user = await userRespository.findUserByEmail(email);

  if (!user) {
    user = await userRespository.createUser({
      email,
      name,
    });
  }

  await userRespository.saveGoogleToken({
    user_id: user.user_id,
    access_token: googleAccessToken,
    refresh_token: googleRefreshToken,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await redis.set(
    `refresh:${user.user_id}`,
    refreshToken,
    'EX',
    7 * 24 * 60 * 60
  );

  return {
    accessToken,
    refreshToken,
    isNew: user.isNew,
    user: {
      email: user.email,
      name: user.name,
    },
  };
};

export const handleTokenRefresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new ValidationError('Invalid refresh token');
  }

  const userId = decoded.user_id;
  const storedToken = await redis.get(`refresh:${userId}`);

  if (storedToken !== refreshToken) {
    throw new ValidationError('Refresh token mismatch');
  }

  const user = await userRespository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await redis.set(
    `refresh:${user.user_id}`,
    newRefreshToken,
    'EX',
    7 * 24 * 60 * 60
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
