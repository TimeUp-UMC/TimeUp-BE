  import { bodyToSchedule } from '../dtos/schedule.dto.js';
  import { updateScheduleWithRules } from '../services/scheduleUpdate.service.js';
  import { UnauthorizedError, InternalServerError, NotFoundError } from '../errors/error.js';

  // 일정 수정

  export const handleUpdateSchedule = async (req, res, next) => {
    try {
      const scheduleId = Number(req.params.id);
      const userId = Number(req.user?.user_id);

      if (!userId) {
        throw new UnauthorizedError();
      }

      const scheduleData = bodyToSchedule(req.body);
      await updateScheduleWithRules(scheduleId, userId, scheduleData);

      return res.success(
        {
        message: '일정이 수정되었습니다.',
        schedule_id: scheduleId,
        },
        200
      );
    } catch (error) {

      if (
        error instanceof ValidationError ||
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        return res.error(error, error.status);
      }

      const internalError = new InternalServerError();
      return res.error(internalError, internalError.status);
    }
  };
