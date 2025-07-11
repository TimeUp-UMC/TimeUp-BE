import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'; //누락된 import 추가
import usersRouter from './src/users/users.router.js'; //사용자 라우터

dotenv.config();

const app = express()
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

//라우터 연결
app.use('/users', usersRouter);

//기본 라우트
app.get('/', (req, res) => {
  res.send('Hello World!')
})

//서버 실행
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})