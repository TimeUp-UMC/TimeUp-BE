import * as authService from '../services/auth.services.js';
import {
  InternalServerError,
  UnauthorizedError,
  ValidationError,
} from '../errors/error.js';

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

export const logout = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      throw new UnauthorizedError();
    }

    await authService.handleLogout(userId);
    res.success({ message: '로그아웃 완료' });
  } catch (err) {
    console.log('Logout Failed', err);
    throw new InternalServerError();
  }
};
