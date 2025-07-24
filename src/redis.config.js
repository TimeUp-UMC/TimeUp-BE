import Redis from 'ioredis';
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
}); // 기본 설정: localhost:6379
export default redis;
