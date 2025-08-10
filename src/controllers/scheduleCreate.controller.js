import { bodyToSchedule } from '../dtos/schedule.dto.js';
import { createScheduleWithRules } from '../services/scheduleCreate.service.js';
import { UnauthorizedError, InternalServerError, ValidationError } from '../errors/error.js';

// 일정 등록

export const handleCreateSchedule = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);

    if (!userId) {
      throw new UnauthorizedError();
    }

    const scheduleData = bodyToSchedule(req.body);
    const scheduleId = await createScheduleWithRules(userId, scheduleData);

    return res.success(
      {
      message: '일정이 등록되었습니다.',
      schedule_id: scheduleId,
      },
      200
    );
  } catch (error) {

    if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        return res.error(error, error.status);
    }

    const internalError = new InternalServerError();
    return res.error(internalError, internalError.status);
  }
};
