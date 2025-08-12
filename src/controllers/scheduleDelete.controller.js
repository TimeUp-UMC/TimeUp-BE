import { deleteScheduleWithRules } from '../services/scheduleDelete.service.js';
import {
  UnauthorizedError, InternalServerError, NotFoundError,
} from '../errors/error.js';

export const handleDeleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = Number(req.params.id);
    const userId = Number(req.user?.user_id);

    if (!userId) {
      throw new UnauthorizedError();
    }

    await deleteScheduleWithRules(scheduleId, userId);

    return res.success(
      {
        message: '일정이 삭제되었습니다.',
        schedule_id: scheduleId,
      },
      200
    );
  } catch (error) {
    console.error('서버 오류 발생:', error);

    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      return res.error(error, error.status);
    }

    const internalError = new InternalServerError();
    return res.error(internalError, internalError.status);
  }
};
