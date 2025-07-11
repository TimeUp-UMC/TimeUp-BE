import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './middlewares/authRouter.js';
import './auth.config.js';

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
