import express from 'express';
import {
  loginWithGoogle,
  refreshToken,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login/google', loginWithGoogle);
router.post('/refresh', refreshToken);

export default router;
