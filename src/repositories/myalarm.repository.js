import { prisma } from "../db.config.js";

// 내 알람 등록
export const addMyAlarmToDB = async (myalarmData) => {
  const newAlarm = await prisma.my_alarms.create({
    data: myalarmData,
  });
  return newAlarm;
};

// 내 알람 수정 + 비활성화
export const updateMyAlarmInDB = async (MyalarmId, myalarmData) => {
    const updatedAlarm = await prisma.my_alarms.update({
      where: { alarm_id: MyalarmId },
      data: myalarmData,
    });
    return updatedAlarm;
};
export const findMyAlarmById = async (MyalarmId) => {
  const Myalarm = await prisma.my_alarms.findUnique({
    where: { alarm_id: MyalarmId },
  });
  return Myalarm
};

// 내 알람 조회
export const getMyAlarmInDB = async (userId) => {
  const myAlarm = await prisma.my_alarms.findMany({
    where: { user_id: userId },
  });
  return myAlarm;
};