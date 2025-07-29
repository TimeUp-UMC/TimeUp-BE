import { prisma } from '../db.config.js';

export const findUserByEmail = async (email) => {
  return await prisma.users.findUnique({ where: { email } });
};

export const findUserById = async (userId) => {
  return await prisma.users.findUnique({ where: { user_id: userId } });
};

export const createUser = async ({ email, name }) => {
  const now = new Date();
  return await prisma.users.create({
    data: {
      email,
      name,
      created_at: now,
      updated_at: now,
      isNew: true,
    },
  });
};

export const saveGoogleToken = async ({
  user_id,
  access_token,
  refresh_token = '',
}) => {
  return await prisma.user_google_token.upsert({
    where: { user_id },
    update: {
      access_token,
      refresh_token,
    },
    create: {
      user_id,
      access_token,
      refresh_token,
    },
  });
};

export const updateUser = async (userId, data) => {
  return await prisma.users.update({
    where: { user_id: userId },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
};

export const saveUserPreferences = async (userId, preferences) => {
  await prisma.user_preference_transport.deleteMany({
    where: { user_id: userId },
  });

  const transportData = preferences.map((p) => ({
    user_id: userId,
    transport: p.transportType,
    priority: p.priority,
  }));

  await prisma.user_preference_transport.createMany({ data: transportData });
};

export const saveWakeupAlarms = async (userId, wakeupObj) => {
  await prisma.wakeup_alarms.deleteMany({ where: { user_id: userId } });

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const data = days
    .filter((day) => wakeupObj[day])
    .map((day, idx) => {
      const [hour, minute, second] = wakeupObj[day].split(':').map(Number);
      const wakeupTime = new Date();
      wakeupTime.setHours(hour, minute, second || 0, 0);

      return {
        user_id: userId,
        day: idx,
        wakeup_time: wakeupTime,
      };
    });

  await prisma.wakeup_alarms.createMany({ data });
};
