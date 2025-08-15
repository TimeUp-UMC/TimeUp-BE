import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routers/authRouter.js';
import alarmRoutes from './routers/alarmRouter.js';
import { startAutoAlarmScheduler } from './schedulers/autoAlarmScheduler.js';
import scheduleRoutes from './routers/scheduleRouter.js';
import userRoutes from './routers/userRouter.js';
import './auth.config.js';
import responseMiddleware from './middlewares/responseMiddleware.js';
import {
  AppError,
  NotFoundError,
  InternalServerError,
} from './errors/error.js';
import { setupSwagger } from '../swagger/swagger.config.js';
import { verifyAccessToken } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
const excludedPaths = [
  '/',
  '/docs',
  '/auth/login/google',
  '/auth/login/master',
  '/auth/refresh',
]; //토큰 인증 제외 경로
setupSwagger(app);

// 응답 미들웨어
app.use(responseMiddleware);
// cors 미들웨어
app.use(cors());
// 정적 파일 제공 미들웨어
app.use(express.static('public'));
// json 본문 파싱 미들웨어
app.use(express.json());
// URL-encoded 본문 파싱 미들웨어
app.use(express.urlencoded({ extended: true }));
// 토큰 검증 미들웨어
app.use((req, res, next) => {
  if (excludedPaths.includes(req.path)) {
    return next();
  }
  verifyAccessToken(req, res, next);
});

// app.use(
//   session({
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: false,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/alarm', alarmRoutes);
app.use('/users', userRoutes);

// 일정 관련 API 라우터
app.use('/schedules', scheduleRoutes);

// 자동 알람 생성 Scheduler
startAutoAlarmScheduler();

// 404 처리
app.use((req, res, next) => {
  throw new NotFoundError('The requested resource was not found');
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.error(err, err.status);
  }

  console.error('Unhandled error:', err);

  // 예기치 못한 에러
  const internalError = new InternalServerError('Internal Server Error');
  return res.error(internalError, internalError.status);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
