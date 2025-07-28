import { NotFoundError, UnauthorizedError } from "../errors/error.js";
import { createMyAlarmDTO } from "../dtos/myalarm.dto.js";
import { addMyAlarmService } from "../services/myalarm.service.js";
import { findMyAlarmById } from "../repositories/myalarm.repository.js";
import { updatedMyAlarmService } from "../services/myalarm.service.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db.config.js";

// 내 알람 등록
export const addMyAlarm = async (req, res, next) => {
    try {
      // 토큰 확인
      const userId = req.user?.user_id;
      
      console.log('user_id:', userId)
  
      // token_id로 사용자 정보 조회
      const exsitingUser = await prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!exsitingUser) {
        throw new NotFoundError('사용자가 없습니다.')
      }
  
      // DTO 생성
      const dto = createMyAlarmDTO(userId, req.body);
  
      // 서비스 호출
      const newMyAlarm = await addMyAlarmService(dto);
  
      return res.success(newMyAlarm);
    } catch (error) {
      next(error);
    }
  };

// 내 알람 수정
 export const updateMyAlarm = async (req, res, next) => {
    try {
      const tokenId = req.headers.authorization?.split(' ')[1];
  
      if (!tokenId) throw new UnauthorizedError('발행된 토큰이 없습니다');
    
      // url에서 alarm_id
      const MyalarmId = parseInt(req.params.alarm_id);

      const existingMyAlarm = await findMyAlarmById(MyalarmId);
      if (!existingMyAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');
      
      // DTO 생성
      const dto = createMyDTO(req.body); // 등록과 동일

      // 서비스 호출
      const updateMy = await updatedMyAlarmService(MyalarmId, dto);

      return res.success(updateMy);
    } catch (error) {
        next(error);
    }
  };

// 내 알람 비활성화
export const inactivationMyAlarm = async (req, res, next) => {
  try {
    const tokenId = req.headers.authorization?.split(' ')[1];

    if (!tokenId) throw new UnauthorizedError('발행된 토큰이 없습니다');
  
    // url에서 alarm_id
    const alarmId = parseInt(req.params.alarm_id);

    const existingMyAlarm = await findMyAlarmById(alarmId);
    if (!existingMyAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');
    
    // DTO 생성
    const dto = inactiveMyDTO(req.body);

    // 서비스 호출
    const updateMyAlarm = await updatedMyAlarmService(WUalarmId, dto); // 수정과 동일

    return res.success(updateMyAlarm);
  } catch (error) {
      next(error);
  }
};

// 내 알람 삭제
export const deleteMyAlarm = async (req, res, next) => {
  try {
    const tokenId = req.headers.authorization?.split(' ')[1];

    if (!tokenId) throw new UnauthorizedError('발행된 토큰이 없습니다');
  
    // url에서 alarm_id
    const alarmId = parseInt(req.params.alarm_id);

    const existingMyAlarm = await findMyAlarmById(alarmId);
    if (!existingMyAlarm) throw new NotFoundError('해당 알람이 존재하지 않습니다.', '404');
    
    // DTO 생성
  

    // 서비스 호출


    return res.success(updateWakeUp);
  } catch (error) {
      next(error);
  }
}