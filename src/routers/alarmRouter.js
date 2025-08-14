import express from 'express';
import {
  addMyAlarm,
  activationMyAlarm,
  updateMyAlarm,
  deleteMyAlarm,
} from '../controllers/myalarm.controller.js';
import {
  activationWakeUpAlarm,
  updateWakeUpAlarm,
} from '../controllers/wakeupalarm.controller.js';
import {
  activationAutoAlarm,
  updateAutoAlarm,
  addAutoAlarm,
  getAutoAlarm,
} from '../controllers/autoalarm.controller.js';
import { getAllAlarm } from '../controllers/alarm.controller.js';
import { pushTokenAlarm } from '../controllers/alarm.controller.js';

const router = express.Router();

// 자동 알람 등록
router.post('/auto', addAutoAlarm);

// 내 알람 등록 API
router.post('/my', addMyAlarm);
// 내 알람 수정 API
router.put('/:alarm_id/my', updateMyAlarm);
// 기상 알람 수정 API
router.put('/:wakeup_alarm_id/wakeup', updateWakeUpAlarm);
// 자동 알람 수정 API
router.put('/:auto_alarm_id/auto', updateAutoAlarm);
// 기상 알람 비활성화 API
router.patch('/:wakeup_alarm_id/wakeup-active', activationWakeUpAlarm);
// 내 알람 비활성화 API
router.patch('/:alarm_id/my-active', activationMyAlarm);
// 자동 알람 비활성화 API
router.patch('/:auto_alarm_id/auto-active', activationAutoAlarm);
// 내 알람 삭제 API
router.delete('/:alarm_id/my-delete', deleteMyAlarm);
// 알람 조회 API
router.get('/alarmlist', getAllAlarm);
// 자동 알람 설정값 조회 API (마이페이지)
router.get('/:auto_alarm_id/auto-mypage', getAutoAlarm);
// 푸시 알람 토큰 저장 API
router.post('/push-token', pushTokenAlarm);

export default router;
