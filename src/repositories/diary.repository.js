import { prisma } from '../db.config.js';

// 일기 등록
export const addDiaryToDB = async (DiaryData) => {
  const newDiary = await prisma.diary.create({
    data: DiaryData,
  });
  return newDiary;
};

// 일기 수정
export const updateDiaryInDB = async (DiaryId, DiaryData) => {
  const updateDiary = await prisma.diary.update({
    where: { diary_id: DiaryId },
    data: DiaryData,
  });
  return updateDiary;
};

// 일기 조회
export const findDiaryById = async (DiaryId) => {
  const Diary = await prisma.diary.findUnique({
    where: { diary_id: DiaryId },
  });
  return Diary;
};

export const getDiaryInDB = async (userId) => {
  const Diary = await prisma.diary.findMany({
    where: { user_id: userId },
    orderBy: {
      diary_date: 'desc',
    },
  });
  return Diary;
};

export const getDiaryByDateInDB = async (userId, date) => {
  //const diaryDate = new Date(date);
  //console.log(diaryDate);

  const Diary = await prisma.diary.findFirst({
    where: {
      user_id: userId,
      diary_date: new Date(date),
    },
  });
  return Diary;
};
