import express from 'express';
import {
  getAllDiary,
  getDiary,
  getDetailDiary,
  addDiary,
  updateDiary,
  deleteDiary,
} from '../controllers/diary.controller.js';

const router = express.Router();

// 전체 일기 조회 API
router.get('/list', getAllDiary);
// 특정 날짜 일기 조회 API
router.get('/date/:yyyymmdd', getDiary);
// 일기 상세 조회 API
router.get('/:diary_id', getDetailDiary);

// 일기 등록 API
router.post('/', addDiary);
// 일기 수정
router.put('/:diary_id', updateDiary);
// 일기 삭제
router.delete('/:diary_id', deleteDiary);

export default router;
