import { NotFoundError, UnauthorizedError } from "../errors/error.js";
import { updateAutoAlarmDTO } from "../dtos/autoalarm.dto.js";
import { activeAutoAlarmDTO } from "../dtos/autoalarm.dto.js";
import { findAutoAlarmById } from "../repositories/autoalarm.repository.js";
import { updatedAutoAlarmService } from "../services/autoalarm.service.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db.config.js";

// 자동 알람 수정
export const updateAutoAlarm = async (req, res, next) => {
  try {
    // url에서 auto_alarm_id
    const ATalarmId = parseInt(req.params.auto_alarm_id);
    console.log('auto_alarm_id:', ATalarmId);

    const existingAutoAlarm = await findAutoAlarmById(ATalarmId);
    if (!existingAutoAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');

    // DTO 생성
    const dto = updateAutoAlarmDTO(ATalarmId, req.body);

    // 서비스 호출
    const updateAuto = await updatedAutoAlarmService(ATalarmId, dto);

    return res.success(updateAuto);
  } catch(error) {
    next(error);
  }
};

// 자동 알람 비활성화
export const activationAutoAlarm = async (req, res, next) => {
  try {
    // url에서 auto_alarm_id
    const ATalarmId = parseInt(req.params.auto_alarm_id);

    const existingAutoAlarm = await findAutoAlarmById(ATalarmId);
    if (!existingAutoAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');
    
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