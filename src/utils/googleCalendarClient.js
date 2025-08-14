import { NotFoundError } from '../errors/error.js';
import * as GoogleTokenRepository from '../repositories/google-token.repository.js';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const createOAuthClientForUser = async (userId) => {
  const tokens = await GoogleTokenRepository.findByUserId(userId);
  if (!tokens) {
    throw new NotFoundError('구글 토큰이 존재하지 않음');
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  // access_token / refresh_token이 갱신되면 DB에 반영
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      if (newTokens.access_token || newTokens.refresh_token) {
        await GoogleTokenRepository.updateTokens(userId, {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
        });
      }
    } catch (e) {
      console.error('Failed to persist refreshed tokens', e);
    }
  });

  return oauth2Client;
};
