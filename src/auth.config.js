import { prisma } from './db.config.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,

    callbackURL: 'http://localhost:3000/auth/google/callback', //인증 후 콜백 URL

    scope: ['profile', 'email'], //요청할 권한
  },
  async (accessToken, refreshToken, profile, done) => {
    return googleVerify(profile, accessToken, refreshToken) //프로필을 이용해 유저를 검증하고, 반환된 유저 정보를 콜백함수로 전달
      .then((user) => done(null, user)) //성공 시 유저 정보 전달
      .catch((err) => done(err)); //실패 시 에러 전달
  }
);

const googleVerify = async (profile, accessToken, refreshToken) => {
  try {
    const email = profile.emails?.[0]?.value; //구글 프로필에서 이메일 추출
    if (email == false) {
      throw new NotFoundError(`profile.email was not found: ${profile}`); // 이메일이 없으면 에러 처리
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (user !== null) {
      // 이미 유저가 존재하면 해당 유저 정보 반환
      return { id: user.user_id, email: user.email, accessToken, refreshToken };
    }

    const createdUser = await prisma.user.create({
      data: {
        user_id: profile.id, //네이버에서 주는 id값을 user_id로 저장
        email,
        name: profile.name || ' ', // 프로필 이름이 없으면 빈 문자열로 처리
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return {
      id: createdUser.user_id,
      email: createdUser.email,
      accessToken,
      refreshToken,
    }; // 새로 생성된 유저의 ID와 이메일 반환
  } catch (err) {
    throw new ValidationError('인증 과정 중 에러 발생');
  }
};

passport.use(googleStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
