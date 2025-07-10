import dotenv from 'dotenv';
import express from 'express';

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

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})