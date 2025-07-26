import express from 'express';
import {
  loginWithGoogle,
  logout,
  onboarding,
  refreshToken,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login/google', loginWithGoogle);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/onboarding', onboarding);

export default router;
