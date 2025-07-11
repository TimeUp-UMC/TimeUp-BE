import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
<<<<<<< HEAD
import session from 'express-session';
import passport from 'passport';
import authRoutes from './middlewares/authRouter.js';
import './auth.config.js';
=======
import cors from 'cors'; //누락된 import 추가
import usersRouter from './src/users/users.router.js'; //사용자 라우터
>>>>>>> 0aa27ea (feat: 마이페이지 API 구현(개인정보, 자동 알람 시간, 피드백))

dotenv.config();

const app = express();
const port = process.env.PORT;

// cors 미들웨어
app.use(cors());
// 정적 파일 제공 미들웨어
app.use(express.static('public'));
// json 본문 파싱 미들웨어
app.use(express.json());
// URL-encoded 본문 파싱 미들웨어
app.use(express.urlencoded({ extended: true }));
//URL-encoded 파싱

<<<<<<< HEAD
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

=======
//라우터 연결
app.use('/users', usersRouter);

//기본 라우트
>>>>>>> 0aa27ea (feat: 마이페이지 API 구현(개인정보, 자동 알람 시간, 피드백))
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);

//서버 실행
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
