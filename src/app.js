import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';

import authRoutes from './middlewares/authRouter.js';
import usersRouter from './src/users/users.router.js'; // 사용자 라우터
import swaggerMiddleware from './swagger/swagger.js'; // Swagger 설정
import './auth.config.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
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

// 라우터 설정
app.use('/auth', authRoutes);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 서버 실행
const startServer = async () => {
  await swaggerMiddleware(app);

  app.listen(port, () => {
    console.log(`TimeUp 서버 실행 중: http://localhost:${port}`);
    console.log(`Swagger 문서: http://localhost:${port}/docs`);
  });
};

startServer();