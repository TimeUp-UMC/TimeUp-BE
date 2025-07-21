import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/error.js';

//req.user에서 다음과 같이 user_id 확인 가능
//{
//  user_id: 2,
//  iat: ..., // 발급 시간
//  exp: ...  // 만료 시간
//}

export const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT 검증 실패', err.message);
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired'));
    } else if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid access token'));
    }
    return next(new InternalServerError('Unexpected auth error'));
  }
};
