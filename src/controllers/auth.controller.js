import * as authService from '../services/auth.services.js';
import { ValidationError } from '../errors/error.js';

export const loginWithGoogle = async (req, res) => {
  console.log('로그인을 요청했습니다.');
  const { access_token, refresh_token } = req.body;

  if (!access_token) {
    throw new ValidationError();
  }

  try {
    const result = await authService.handleGoogleLogin({
      googleAccessToken: access_token,
      googleRefreshToken: refresh_token,
    });
    res.success(result);
  } catch (err) {
    console.log('Login failed', err.message);
    throw new ValidationError();
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return new ValidationError('Refresh Token is required.');
    }

    const result = await authService.handleTokenRefresh(refresh_token);
    res.success(result);
  } catch (err) {
    console.log('Refresh failed', err.message);
    throw new ValidationError('Invalid or expired refresh token');
  }
};
