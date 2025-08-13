import { prisma } from '../db.config.js';

export const findByUserId = async (userId) => {
  return prisma.user_google_token.findUnique({
    where: { user_id: userId },
  });
};

export const upsert = async (userId, { accessToken, refreshToken }) => {
  return prisma.user_google_token.upsert({
    where: { user_id: userId },
    update: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
    create: {
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
};

export const updateTokens = async (userId, { accessToken, refreshToken }) => {
  return prisma.user_google_token.update({
    where: { user_id: userId },
    data: {
      ...(accessToken ? { access_token: accessToken } : {}),
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    },
  });
};
