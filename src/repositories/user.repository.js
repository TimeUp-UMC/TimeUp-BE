import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findUserById = (userId) => {
  return prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      email: true,
      name: true,
      birth: true,
      job: true,
      avg_ready_time: true,
      duration_time: true,
      alarm_check_time: true,
      home_address: true,
      work_address: true,
      user_preference_transport: {
        select: {
          transport: true,
          priority: true,
        },
        orderBy: { priority: 'asc' }, //우선순위 순으로 정렬
      },
    },
  });
};

export const updateUser = async (userId, updateData) => {
  const {
    birth,
    avg_ready_time,
    duration_time,
    home_address,
    work_address,
    job,
    preferences,
  } = updateData;

  return await prisma.$transaction(async (tx) => {
    await tx.users.update({
      where: { user_id: userId },
      data: {
        birth,
        avg_ready_time,
        duration_time,
        home_address,
        work_address,
        job,
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
  });
};

export const getAlarmCheckTime = (userId) => {
  return prisma.users
    .findUnique({
      where: { user_id: userId },
      select: { alarm_check_time: true },
    })
    .then((user) => user.alarm_check_time);
};

export const updateAlarmCheckTime = (userId, alarm_check_time) => {
  return prisma.users.update({
    where: { user_id: userId },
    data: { alarm_check_time },
  });
};

export const createAlarmFeedback = (
  userId,
  auto_alarm_id,
  time_rating,
  wakeup_rating,
  comment
) => {
  return prisma.wakeup_feedbacks.create({
    data: {
      user_id: userId,
      auto_alarm_id,
      time_rating,
      wakeup_rating,
      comment,
    },
  });
};
