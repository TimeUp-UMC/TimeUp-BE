import * as authService from '../services/auth.services.js';
import { ValidationError } from '../errors/error.js';

export const loginWithGoogle = async (req, res) => {
  console.log('로그인을 요청했습니다.');
  const { access_token } = req.body;

  if (!access_token) {
    throw new ValidationError();
  }

  try {
    const result = await authService.handleGoogleLogin(access_token);
    res.success(result);
  } catch (err) {
    console.log('Login failed', err);
    throw new ValidationError();
  }
};
