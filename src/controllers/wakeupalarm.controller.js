import { createWakeUpAlarmDTO } from "../dtos/wakeupalarm.dto.js";
import { activeWakeUpAlarmDTO } from "../dtos/wakeupalarm.dto.js";
import { NotFoundError } from "../errors/error.js";
import { findWakeUpAlarmById } from "../repositories/wakeupalarm.repository.js"; 
import { updatedWakeUpAlarmService } from "../services/wakeupalarm.service.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from"../db.config.js";

/*
// 기상 알람 등록
export const addWakeUpAlarm = async (req, res, next) => {
  try {
    const tokenId = req.headers.authorization?.split(' ')[1];

    if (!tokenId) throw new UnauthorizedError('발행된 토큰이 없습니다');

    // token_id로 사용자 정보 조회
    const tokenWithUser = await prisma.token.findUnique({
      where: { token_id: tokenId },
      include: { user: true },
    });

    const userProfile = tokenWithUser?.user;
    if (!userProfile?.wakeTime) {
      throw new BusinessLogicError('사용자의 기상 시간이 설정되어 있지 않습니다. 마이페이지에서 먼저 기상 시간을 설정해주세요.','A001');
    }

    // DTO 생성
    const dto = createWakeUpDTO(req.body, userProfile);

    // 서비스 호출
    const newWakeUpAlarm = await addWakeUpAlarmService(dto);

    return res.success(newWakeUpAlarm);
  } catch (error) {
    next(error);
  }
};
*/

// 기상 알람 수정
export const updateWakeUpAlarm = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id 
    const userId = req.user?.user_id;
      
    console.log('user_id:', userId)

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.')
    }
    // url에서 wakeup_alarm_id
    const WUalarmId = parseInt(req.params.wakeup_alarm_id);

    const existingWakeUpAlarm = await findWakeUpAlarmById(WUalarmId);
    if (!existingWakeUpAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');
    
    // DTO 생성
    const dto = createWakeUpAlarmDTO(userId, req.body);

    // 서비스 호출
    const updateWakeUp = await updatedWakeUpAlarmService(WUalarmId, dto);

    return res.success(updateWakeUp);
  } catch (error) {
      next(error);
  }
};

// 기상 알람 비활성화
export const activationWakeUpAlarm = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id 
    const userId = req.user?.user_id;
      
    console.log('user_id:', userId)

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.')
    }
  
    // url에서 wakeup_alarm_id
    const WUalarmId = parseInt(req.params.wakeup_alarm_id);

    const existingWakeUpAlarm = await findWakeUpAlarmById(WUalarmId);
    if (!existingWakeUpAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');
    
    // DTO 생성
    const currentState = existingWakeUpAlarm.is_active;
    const dto = activeWakeUpAlarmDTO(userId, currentState);

    // 서비스 호출
    const updateWakeUp = await updatedWakeUpAlarmService(WUalarmId, dto); // 수정과 동일

    return res.success(updateWakeUp);
  } catch (error) {
      next(error);
  }
}