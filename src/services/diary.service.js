import {
  addDiaryToDB,
  updateDiaryInDB,
  getDiaryInDB,
  findDiaryById,
  getDiaryByDateInDB,
} from '../repositories/diary.repository.js';
import { BusinessLogicError } from '../errors/error.js';
import { prisma } from '../db.config.js';

// 일기 등록
export const addDiaryService = async (dto) => {
  const existingDiary = await prisma.diary.findFirst({
    where: {
      user_id: dto.user_id,
      diary_date: dto.diary_date,
    },
  });

  if (existingDiary) {
    throw new BusinessLogicError('이미 해당 날짜에 일기가 존재합니다.');
  }

  const newDiary = await addDiaryToDB(dto);
  return newDiary;
};

// 일기 수정
export const updatedDiaryService = async (DiaryId, dto) => {
  const updateDiary = await updateDiaryInDB(DiaryId, dto);
  return updateDiary;
};

// 일기 조회
export const getDiaryByUserId = async (userId) => {
  const Diary = await getDiaryInDB(userId);
  return Diary;
};

// 날짜 일기 조회
export const getDiaryByDate = async (userId, date) => {
  const Diary = await getDiaryByDateInDB(userId, date);
  if (!Diary) return null;

  return Diary;
};

// 일기 상세 조회
export const getDetailDiaryId = async (DiaryId) => {
  const Diary = await findDiaryById(DiaryId);
  if (!Diary) return null;

  return Diary;
};
