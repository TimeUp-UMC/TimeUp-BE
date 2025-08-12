import { prisma } from '../db.config.js';

// 리마인드 규칙 삭제
export const deleteRemindRule = async (scheduleId) => {
  return await prisma.remind_rules.deleteMany({
    where: { schedule_id: scheduleId },
  });
};

// 반복 규칙 및 반복 요일 삭제
export const deleteRecurrenceRule = async (scheduleId) => {
  const recurrence = await prisma.recurrence_rules.findUnique({
    where: { schedule_id: scheduleId },
  });
  if (!recurrence) return;

  await prisma.repeat_weekdays.deleteMany({
    where: { recurrence_id: recurrence.recurrence_id },
  });

  await prisma.recurrence_rules.delete({
    where: { recurrence_id: recurrence.recurrence_id },
  });
};

// 일정 삭제
export const deleteScheduleById = async (scheduleId, userId) => {
  return await prisma.schedules.deleteMany({
    where: { schedule_id: scheduleId, user_id: userId },
  });
};
