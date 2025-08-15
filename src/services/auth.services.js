import * as userRespository from '../repositories/auth.repositories.js';
import { getGoogleUserInfo } from '../utils/googleAuth.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import redis from '../redis.config.js';
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../errors/error.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.config.js';

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

export const handleLogout = async (userId) => {
  await redis.del(`refresh:${userId}`);
};

export const handleOnboarding = async (userId, data) => {
  try {
    await userRespository.saveOnboardingData(userId, data);
  } catch (err) {
    throw err;
  }
};

export const deleteUserAccount = async (userId) => {
  await prisma.$transaction(async (tx) => {
    const scheduleIds = await tx.schedules.findMany({
      where: { user_id: userId },
      select: { schedule_id: true },
    });

    const scheduleIdList = scheduleIds.map((s) => s.schedule_id);

    if (scheduleIdList.length > 0) {
      await tx.remind_rules.deleteMany({
        where: { schedule_id: { in: scheduleIdList } },
      });

      const recurrenceIds = await tx.recurrence_rules.findMany({
        where: { schedule_id: { in: scheduleIdList } },
        select: { recurrence_id: true },
      });

      const recurrenceIdList = recurrenceIds.map((r) => r.recurrence_id);
      if (recurrenceIdList.length > 0) {
        await tx.repeat_weekdays.deleteMany({
          where: { recurrence_id: { in: recurrenceIdList } },
        });
      }

      await tx.recurrence_rules.deleteMany({
        where: { schedule_id: { in: scheduleIdList } },
      });

      await tx.auto_alarms.deleteMany({
        where: { schedule_id: { in: scheduleIdList } },
      });

      await tx.schedules.deleteMany({
        where: { user_id: userId },
      });
    }

    await tx.wakeup_alarms.deleteMany({ where: { user_id: userId } });
    await tx.my_alarms.deleteMany({ where: { user_id: userId } });
    await tx.wakeup_feedbacks.deleteMany({ where: { user_id: userId } });
    await tx.user_preference_transport.deleteMany({
      where: { user_id: userId },
    });
    await tx.user_google_token.deleteMany({ where: { user_id: userId } });
    await tx.diary.deleteMany({ where: { user_id: userId } });

    await tx.users.deleteMany({ where: { user_id: userId } });
    await redis.del(`refresh:${userId}`);
  });
};
