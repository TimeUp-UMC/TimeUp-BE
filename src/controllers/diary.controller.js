import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/error.js';
import { getDiaryDTO, createDiaryDTO } from '../dtos/diary.dto.js';
import {
  getDiaryByUserId,
  getDiaryByDate,
  addDiaryService,
  updatedDiaryService,
  getDetailDiaryId,
} from '../services/diary.service.js';
import { findDiaryById } from '../repositories/diary.repository.js';
import { prisma } from '../db.config.js';

// 전체 일기 조회
export const getAllDiary = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.');
    }

    // 일기 조회
    const Diary = await getDiaryByUserId(userId);
    if (!Diary) return Diary;

    // DTO 생성
    const DiaryData = Diary.map(getDiaryDTO);

    const responseData = {
      diary: DiaryData,
    };

    return res.success(responseData);
  } catch (error) {
    next(error);
  }
};

// 특정 날짜 일기 조회
export const getDiary = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.');
    }

    const { yyyymmdd } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    if (!yyyymmdd || !dateRegex.test(yyyymmdd)) {
      return res.error(
        { message: '잘못된 날짜 형식입니다. YYYY-MM-DD로 입력하세요.' },
        400
      );
    }

    // 일기 조회
    const Diary = await getDiaryByDate(userId, yyyymmdd);
    if (!Diary) {
      return res.success({
        message: '해당 날짜에 일기가 없습니다.',
        diary: null,
      });
    }
    return res.success({
      message: '일기 조회 완료',
      diary: Diary,
    });
  } catch (error) {
    next(error);
  }
};

// 일기 상세 조회
export const getDetailDiary = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;
    const diaryId = Number(req.params.diary_id);
    if (!userId) throw new UnauthorizedError();
    const diary = await getDetailDiaryId(diaryId);

    if (!diary) throw new NotFoundError('해당 일기를 찾을 수 없습니다.');
    if (diary.user_id !== userId)
      throw new ForbiddenError('해당 일기에 접근할 수 없습니다.');

    res.success(
      {
        message: `상세 일기 조회 완료`,
        diary: {
          diary_id: diary.diary_id,
          title: diary.title,
          content: diary.content,
          diary_date: diary.diary_date,
        },
      },
      200
    );
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError
    ) {
      return res.error(error, error.status);
    }
  }
};

// 일기 추가
export const addDiary = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    console.log('user_id:', userId);

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.');
    }
    // DTO 생성
    const dto = createDiaryDTO(userId, req.body);

    // 서비스 호출
    const newDiary = await addDiaryService(dto);

    return res.success({
      message: `일기 등록 완료`,
      diary_id: newDiary.diary_id,
    });
  } catch (error) {
    next(error);
  }
};

// 일기 수정
export const updateDiary = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    console.log('user_id:', userId);

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.');
    }

    // url에서 diary_id
    const DiaryId = parseInt(req.params.diary_id);

    const existingDiary = await findDiaryById(DiaryId);
    if (!existingDiary)
      throw new NotFoundError('해당 일기가 존재하지 않습니다.', '404');

    // DTO 생성
    const dto = createDiaryDTO(userId, req.body); // 등록과 동일

    // 서비스 호출
    const updateDiary = await updatedDiaryService(DiaryId, dto);

    return res.success({
      message: `일기 수정 완료`,
      diary_id: updateDiary.diary_id,
    });
  } catch (error) {
    next(error);
  }
};

// 일기 삭제
export const deleteDiary = async (req, res, next) => {
  try {
    // 토큰 확인 및 user_id
    const userId = req.user?.user_id;

    console.log('user_id:', userId);

    // token_id로 사용자 정보 조회
    const exsitingUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!exsitingUser) {
      throw new NotFoundError('사용자가 없습니다.');
    }

    // url에서 diary_id
    const diaryId = parseInt(req.params.diary_id);

    const existingDiary = await findDiaryById(diaryId);
    if (!existingDiary)
      throw new NotFoundError('해당 일기가 존재하지 않습니다.', '404');

    // 일기 삭제
    const deletedAlarm = await prisma.diary.delete({
      where: { diary_id: diaryId },
    });

    return res.success({
      message: `일기 삭제 완료`,
      diary_id: diaryId,
    });
  } catch (error) {
    next(error);
  }
};
