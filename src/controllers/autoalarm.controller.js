import { NotFoundError } from '../errors/error.js';
import {
  updateAutoAlarmDTO,
  activeAutoAlarmDTO,
  getMPAutoAlarmDTO,
} from '../dtos/autoalarm.dto.js';
import { addAutoAlarmService } from '../services/autoalarm.service.js';
import {
  findAutoDataById,
  findAutoAlarmById,
} from '../repositories/autoalarm.repository.js';
import { updatedAutoAlarmService } from '../services/autoalarm.service.js';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../db.config.js';

// 자동 알람 생성
export const addAutoAlarm = async (req, res, next) => {
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
    // DTO 생성
    //const dto = createAutoAlarmDTO(userId, req.body);

    // 서비스 호출
    const newAutoAlarm = await addAutoAlarmService({ userId });

    return res.success(newAutoAlarm);
  } catch (error) {
    next(error);
  }
};

// 자동 알람 수정
export const updateAutoAlarm = async (req, res, next) => {
  try {
    // url에서 auto_alarm_id
    const ATalarmId = parseInt(req.params.auto_alarm_id);
    //console.log('auto_alarm_id:', ATalarmId);

    const existingAutoAlarm = await findAutoAlarmById(ATalarmId);
    if (!existingAutoAlarm)
      throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');

    // DTO 생성
    const dto = updateAutoAlarmDTO(ATalarmId, req.body);

    // 서비스 호출
    const updateAuto = await updatedAutoAlarmService(ATalarmId, dto);

    return res.success(updateAuto);
  } catch (error) {
    next(error);
  }
};

// 자동 알람 비활성화
export const activationAutoAlarm = async (req, res, next) => {
  try {
    // url에서 auto_alarm_id
    const ATalarmId = parseInt(req.params.auto_alarm_id);

    const existingAutoAlarm = await findAutoAlarmById(ATalarmId);
    if (!existingAutoAlarm)
      throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');

    const scheduleId = existingAutoAlarm.schedule_id;

    // DTO 생성
    const currentState = existingAutoAlarm.is_active;
    const dto = activeAutoAlarmDTO(scheduleId, currentState);

    // 서비스 호출
    const updateAutoAlarm = await updatedAutoAlarmService(ATalarmId, dto); // 수정과 동일

    return res.success(updateAutoAlarm);
  } catch (error) {
    next(error);
  }
};

// 자동 알람 설정값 조회 api (마이페이지)
export const getAutoAlarm = async (req, res, next) => {
  try {
    // url에서 auto_alarm_id
    const ATalarmId = parseInt(req.params.auto_alarm_id);

    const existingAutoAlarm = await findAutoAlarmById(ATalarmId);
    if (!existingAutoAlarm)
      throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');

    // DTO 생성
    const dto = getMPAutoAlarmDTO(existingAutoAlarm, ATalarmId);

    return res.success(dto);
  } catch (error) {
    next(error);
  }
};
