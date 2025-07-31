import express from 'express';
import { handleCreateSchedule } from '../controllers/scheduleCreate_controller.js';

const router = express.Router();

// 일정 등록 API
router.post('/', handleCreateSchedule);

export default router;
