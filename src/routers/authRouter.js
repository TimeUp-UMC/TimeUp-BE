import express from 'express';
import {
  deleteAccount,
  loginWithGoogle,
  loginWithGoogleMaster,
  logout,
  onboarding,
  refreshToken,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login/google', loginWithGoogle);
router.post('/login/master', loginWithGoogleMaster);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/onboarding', onboarding);
router.delete('/signout', deleteAccount);

export default router;
