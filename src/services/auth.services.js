import * as userRespository from '../repositories/auth.repositories.js';
import { getGoogleUserInfo } from '../utils/googleAuth.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import redis from '../redis.config.js';
import { ValidationError } from '../errors/error.js';

export const handleGoogleLogin = async (googleAccessToken) => {
  const googleProfile = await getGoogleUserInfo(googleAccessToken);

  console.log(googleProfile);
  const email = googleProfile.email;
  const name = googleProfile.name;

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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  //   await redis.set(
  //     `refresh:${user.user_id}`,
  //     refreshToken,
  //     'EX',
  //     7 * 24 * 60 * 60
  //   );

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
