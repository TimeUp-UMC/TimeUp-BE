import express from 'express';
import { handleCreateSchedule } from '../controllers/scheduleCreate.controller.js';
import { handleUpdateSchedule } from '../controllers/scheduleUpdate.controller.js';
import { handleDeleteSchedule } from '../controllers/scheduleDelete.controller.js';
import { handleGetMonthlySchedule } from '../controllers/scheduleMonthly.controller.js';

const router = express.Router();

// 일정 등록 API
router.post('/', handleCreateSchedule);
// 일정 수정 API
router.put('/:id', handleUpdateSchedule);
// 일정 삭제 API
router.delete('/:id', handleDeleteSchedule);
// 월별 일정 조회 API
router.get('/days', handleGetMonthlySchedule);

export default router;