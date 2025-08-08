import { NotFoundError } from "../errors/error.js";
import { getWakeUpAlarmDTO } from "../dtos/wakeupalarm.dto.js";
import { getMyalarmDTO } from "../dtos/myalarm.dto.js";
import { getAutoAlarmDTO } from "../dtos/autoalarm.dto.js";
import { getWakeUpAlarmByUserId } from "../services/wakeupalarm.service.js";
import { getMyAlarmByUserId } from "../services/myalarm.service.js";
import { getAutoAlarmByUserId } from "../services/autoalarm.service.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db.config.js";

// 알람 조회 API
export const getAllAlarm = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    console.log("user_id:", userId);

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError("사용자가 없습니다.");
    }

    // 기상 알람 조회

    // 서비스 호출
    const WakeUpAlarm = await getWakeUpAlarmByUserId(userId); // 기상 알람
    if (!WakeUpAlarm) return WakeUpAlarm;
    const MyAlarm = await getMyAlarmByUserId(userId); // 내 알람
    if (!MyAlarm) return MyAlarm;
    const AutoAlarm = await getAutoAlarmByUserId(userId); // 자동 알람
    if (!AutoAlarm) return AutoAlarm;
    console.log("autoalarm data: ", AutoAlarm);

    // DTO 생성
    const WakeUpAlarmData = WakeUpAlarm.map(getWakeUpAlarmDTO); // 기상 알람
    const MyAlarmData = MyAlarm.map(getMyalarmDTO); // 내 알람
    const AutoAlarmData = AutoAlarm.map(getAutoAlarmDTO); // 자동 알람

    const responseData = {
      wakeup_alarms: WakeUpAlarmData,
      my_alarms: MyAlarmData,
      auto_alarms: AutoAlarmData,
    };
    return res.success(responseData);
  } catch (error) {
    next(error);
  }
};
