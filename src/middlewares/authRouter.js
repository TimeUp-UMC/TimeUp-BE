import express from 'express';
import redis from '../redis.config.js';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const router = express.Router();

router.get(
  '/auth',
  passport.authenticate('google', { scope: ['profile', 'email'] })
); // 프로파일과 이메일 정보를 받는다.

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    const user = req.user;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    res.json({ accessToken, refreshToken });
  }
);

export default router;
