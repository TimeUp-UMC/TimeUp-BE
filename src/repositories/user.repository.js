import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllUserIds = async () => {
  const users = await prisma.users.findMany({
    select: {
      user_id: true, // ✅ user_id만 가져오기
    },
  });

  // user_id만 추출해서 배열로 반환 (숫자 배열)
  return users.map((user) => user.user_id);
};

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
    },
  });
};

export const updateUser = (userId, updateData) => {
  return prisma.users.update({
    where: { user_id: userId },
    data: updateData,
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
  time_rating,
  wakeup_rating,
  comment
) => {
  return prisma.wakeup_feedbacks.create({
    data: {
      user_id: userId,
      time_rating,
      wakeup_rating,
      comment,
    },
  });
};
