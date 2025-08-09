import express from 'express';
import {
  getUserInfo,
  updateUserInfo,
  getAlarmCheckTime,
  updateAlarmCheckTime,
  submitAlarmFeedback,
} from '../controllers/user.controller.js';

import authRouter from '../routers/authRouter.js'; // user.id 파싱을 위한 미들웨어

const router = express.Router();

// 마이페이지 관련 API
router.get('/me', getUserInfo);
router.put('/me', updateUserInfo);
router.patch('/me', updateUserInfo);

router.get('/me/auto-alarm-check-time', getAlarmCheckTime);
router.put('/me/auto-alarm-check-time', updateAlarmCheckTime);
router.patch('/me/auto-alarm-check-time', updateAlarmCheckTime);

//router.post('/me/auto-alarm-feedback', submitAlarmFeedback);

export default router;
