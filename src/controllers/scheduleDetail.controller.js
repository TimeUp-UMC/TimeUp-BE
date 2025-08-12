import { getScheduleDetailByScheduleId } from '../services/scheduleDetail.service.js';
import { UnauthorizedError, NotFoundError, ForbiddenError, InternalServerError } from '../errors/error.js';

// 일정 상세 조회

export const handleGetScheduleDetail = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);
    const scheduleId = Number(req.params.id);

    if (!userId) throw new UnauthorizedError();

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

    if (
      error instanceof UnauthorizedError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError
    ) {
        return res.error(error, error.status);
    }

    const internalError = new InternalServerError();
    return res.error(internalError, internalError.status);
  }
};