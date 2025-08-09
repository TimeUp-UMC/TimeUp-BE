import {
  addMyAlarmToDB,
  updateMyAlarmInDB,
  getMyAlarmInDB,
} from '../repositories/myalarm.repository.js';

// 내 알람 등록
export const addMyAlarmService = async (dto) => {
  const newAlarm = await addMyAlarmToDB(dto);
  return newAlarm;
};

// 내 알람 수정
export const updatedMyAlarmService = async (MyalarmId, dto) => {
  const updateMyAlarm = await updateMyAlarmInDB(MyalarmId, dto);
  return updateMyAlarm;
};

// 내 알람 조회
export const getMyAlarmByUserId = async (userId) => {
  const myAlarm = await getMyAlarmInDB(userId);
  return myAlarm;
};
