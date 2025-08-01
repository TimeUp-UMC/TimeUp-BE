import { bodyToSchedule } from '../dtos/schedule.dto.js';
import { createScheduleWithRules } from '../services/scheduleCreate.service.js';
import { AppError } from '../errors/error.js';

// 일정 등록 요청을 처리하는 컨트롤러
// 클라이언트로부터 전달된 일정 정보를 받아 비즈니스 로직으로 전달
// 성공적으로 일정이 생성되면 일정 ID와 메시지를 반환
// 인증 정보 누락 및 유효성 오류 발생 시 커스텀 에러를 반환
export const handleCreateSchedule = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      throw new AppError('로그인 정보가 없습니다.', StatusCodes.UNAUTHORIZED, 'UnauthorizedError');
    }

    const scheduleData = bodyToSchedule(req.body);
    const scheduleId = await createScheduleWithRules(userId, scheduleData);

    return res.success({
      message: '일정이 등록되었습니다.',
      schedule_id: scheduleId,
    }, StatusCodes.CREATED);

  } catch (error) {
    return res.error(error, error.status || StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
