class AppError extends Error {
  constructor(message, status = 500, errorCode = 'AppError') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = '유효성 검사 실패') {
    super(message, 400, 'ValidationError');
  }
}

class NotFoundError extends AppError {
  constructor(message = '리소스를 찾을 수 없음') {
    super(message, 404, 'NotFoundError');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '유효하지 않은 액세스 토큰') {
    super(message, 401, 'UnauthorizedError');
  }
}

class ForbiddenError extends AppError {
  constructor(message = '접근 권한 없음') {
    super(message, 403, 'ForbiddenError');
  }
}

class InternalServerError extends AppError {
  constructor(message = '서버 오류 발생') {
    super(message, 500, 'InternalServerError');
  }
}

class BusinessLogicError extends AppError {
  constructor(message = '비즈니스 로직 위반') {
    // 추가 에러 처리
    super(message, 400, 'BusinessLogicError');
  }
}

class ConflictError extends AppError {
  constructor(message = '이미 존재하는 리소스') {
    // 중복 처리
    super(message, 409, 'ConflictError');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = '요청이 너무 많음') {
    super(message, 429, 'TooManyRequestsError');
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  BusinessLogicError,
  ConflictError,
  TooManyRequestsError,
};
