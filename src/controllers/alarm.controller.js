import { ForbiddenError, NotFoundError } from '../errors/error.js';
import { getWakeUpAlarmDTO } from '../dtos/wakeupalarm.dto.js';
import { getMyalarmDTO } from '../dtos/myalarm.dto.js';
import { getAutoAlarmDTO } from '../dtos/autoalarm.dto.js';
import { getWakeUpAlarmByUserId } from '../services/wakeupalarm.service.js';
import { getMyAlarmByUserId } from '../services/myalarm.service.js';
import { getAutoAlarmByUserId } from '../services/autoalarm.service.js';
import { savePushTokenService } from '../services/alarm.service.js';
import { prisma } from '../db.config.js';

// 알람 조회 API
export const getAllAlarm = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.');
    }

    // 자동 알람 생성
    addAutoAlarmService({ userId });

    // 기상 알람 조회
    // 서비스 호출
    const WakeUpAlarm = await getWakeUpAlarmByUserId(userId); // 기상 알람
    if (!WakeUpAlarm) return WakeUpAlarm;
    const MyAlarm = await getMyAlarmByUserId(userId); // 내 알람
    if (!MyAlarm) return MyAlarm;
    const AutoAlarm = await getAutoAlarmByUserId(userId); // 자동 알람
    if (!AutoAlarm) return AutoAlarm;
    //console.log('autoalarm data: ', AutoAlarm);

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

// 푸시 토큰 저장
export const pushTokenAlarm = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user?.user_id;

    if (!token) {
      throw new ForbiddenError('푸시 알람 토큰이 없습니다.');
    }
    await savePushTokenService(userId, token);
    res.success(userId, console.log('푸시 알람 토큰 저장 성공'));
  } catch (error) {
    next(error);
  }
};
