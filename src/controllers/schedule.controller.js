import { StatusCodes } from "http-status-codes";
import { bodyToSchedule } from "../dtos/schedule.dto.js";
import {
  createScheduleWithRules,
  updateScheduleWithRules,
  deleteScheduleWithRules,
} from "../services/schedule.service.js";

export const handleCreateSchedule = async (req, res) => {
  const scheduleId = await createScheduleWithRules(req.user.userId, bodyToSchedule(req.body));
  res.status(StatusCodes.CREATED).json({
    scheduleId,
    message: "일정이 성공적으로 등록되었습니다.",
  });
};

export const handleUpdateSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  await updateScheduleWithRules(+scheduleId, req.user.userId, bodyToSchedule(req.body));
  res.status(StatusCodes.OK).json({
    message: "일정이 성공적으로 수정되었습니다.",
  });
};

export const handleDeleteSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  await deleteScheduleWithRules(+scheduleId, req.user.userId);
  res.status(StatusCodes.OK).json({
    message: "일정이 성공적으로 삭제되었습니다.",
  });
};
