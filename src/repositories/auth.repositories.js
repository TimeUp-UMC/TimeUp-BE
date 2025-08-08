import { prisma } from '../db.config.js';
import { BusinessLogicError } from '../errors/error.js';

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

      const wakeupTime = new Date(
        Date.UTC(1970, 0, 1, hour, minute, second || 0)
      );

      return {
        user_id: userId,
        day: idx,
        wakeup_time: wakeupTime,
      };
    });

  await prisma.wakeup_alarms.createMany({ data });
};

export const saveOnboardingData = async (userId, onboardingData) => {
  const {
    birth,
    job,
    avg_ready_time,
    duration_time,
    home_address,
    work_address,
    preferences,
    wakeup_time,
  } = onboardingData;

  return await prisma.$transaction(async (tx) => {
    await tx.users.update({
      where: { user_id: userId },
      data: {
        birth,
        job,
        avg_ready_time,
        duration_time,
        home_address,
        work_address,
        isNew: false,
        updated_at: new Date(),
      },
    });

    await tx.user_preference_transport.deleteMany({
      where: { user_id: userId },
    });
    await tx.user_preference_transport.createMany({
      data: preferences.map((p) => ({
        user_id: userId,
        transport: p.transportType,
        priority: p.priority,
      })),
    });

    await tx.wakeup_alarms.deleteMany({ where: { user_id: userId } });

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const inputDays = Object.keys(wakeup_time);

    const invalidKeys = inputDays.filter((key) => !days.includes(key));
    if (invalidKeys.length > 0) {
      throw new BusinessLogicError(
        `유효하지 않은 요일 키: ${invalidKeys.join(', ')}`
      );
    }
    const alarms = days
      .filter((day) => wakeup_time[day])
      .map((day, idx) => {
        const [hour, minute, second] = wakeup_time[day].split(':').map(Number);

        const wakeupTime = new Date(
          Date.UTC(1970, 0, 1, hour, minute, second || 0)
        );

        return {
          user_id: userId,
          day: idx,
          wakeup_time: wakeupTime,
        };
      });

    await tx.wakeup_alarms.createMany({ data: alarms });
  });
};
