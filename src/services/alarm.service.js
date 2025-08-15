import { updatedPushTokenInDB } from "../repositories/alarm.repository.js";

// 푸시 알람 토큰 저장
export const savePushTokenService = async (userId, token) => {
    return updatedPushTokenInDB(userId, token);
};