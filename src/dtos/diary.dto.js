import { BusinessLogicError } from '../errors/error.js';

// 일기 등록 + 수정
export const createDiaryDTO = (userId, body) => {
  const { title, content, diary_date } = body;

  if (!diary_date)
    throw new BusinessLogicError('일기 날짜를 설정하지 않았습니다.', '400');
  if (!title)
    throw new BusinessLogicError('일기 제목을 작성하지 않았습니다.', '400');
  if (!content)
    throw new BusinessLogicError('일기 내용을 작성하지 않았습니다.', '400');

  const diaryDateObj = new Date(diary_date);

  // 미래 날짜 체크 (KST 기준)
  const nowKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  if (diaryDateObj > nowKST) {
    throw new BusinessLogicError(
      '미래 날짜의 일기는 등록할 수 없습니다.',
      '400'
    );
  }

  return { user_id: userId, title, diary_date: diaryDateObj, content };
};

export const getDiaryDTO = (Diary) => {
  return {
    diary_id: Diary.diary_id,
    title: Diary.title,
    content: Diary.content,
    diary_date: Diary.diary_date,
  };
};
