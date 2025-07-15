import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './middlewares/authRouter.js';
import './auth.config.js';
import responseMiddleware from './middlewares/responseMiddleware.js';
import {
  AppError,
  NotFoundError,
  InternalServerError,
} from './errors/error.js';
import { setupSwagger } from '../swagger/swagger.config.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
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

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);

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
