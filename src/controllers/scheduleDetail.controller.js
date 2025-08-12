import { getScheduleDetailByScheduleId } from '../services/scheduleDetail.service.js';
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '../errors/error.js';

export const handleGetScheduleDetail = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);
    const scheduleId = Number(req.params.id);

    if (!userId) throw new UnauthorizedError();
    if (!scheduleId) throw new ValidationError('일정 ID를 입력해주세요.');

    const schedule = await getScheduleDetailByScheduleId(scheduleId);

    if (!schedule) throw new NotFoundError('해당 일정을 찾을 수 없습니다.');
    if (schedule.user_id !== userId) throw new ForbiddenError('해당 일정에 접근할 수 없습니다.');

    res.success(
      {
        message: '조회하신 일정의 상세 정보입니다.',
        schedule: schedule,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};