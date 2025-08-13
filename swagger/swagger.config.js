import swaggerUi from 'swagger-ui-express';
import path from 'path';
import YAML from 'yamljs';
import { cwd } from 'process';
import dotenv from 'dotenv';

dotenv.config();

const userSwagger = YAML.load(path.join(cwd(), '/swagger/users_swagger.yaml'));
const authSwagger = YAML.load(path.join(cwd(), '/swagger/auth_swagger.yaml'));
const alarmSwagger = YAML.load(
  path.join(cwd(), '/swagger/alarms_swagger.yaml')
);
const scheduleSwagger = YAML.load(
  path.join(cwd(), '/swagger/schedules_swagger.yaml')
);
const diarySwagger = YAML.load(path.join(cwd(), '/swagger/diary_swagger.yaml'));

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Swagger',
    version: '1.0.0',
    description: 'TIme Up',
  },
  tags: [
    { name: 'Auth', description: '인증 관련 API' },
    { name: 'Users', description: '사용자 관련 API' },
    { name: 'Alarms', description: '알림 관련 API' },
    { name: 'Schedules', description: '일정 관련 API' },
    { name: 'Diary', description: '일기 관련 API' },
  ],
  paths: {
    ...userSwagger.paths,
    ...authSwagger.paths,
    ...alarmSwagger.paths,
    ...scheduleSwagger.paths,
    ...diarySwagger.paths,
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ...userSwagger.components?.schemas,
      ...authSwagger.components?.schemas,
      ...alarmSwagger.components?.schemas,
      ...scheduleSwagger.components?.schemas,
      ...diarySwagger.components?.schemas,
    },
  },
};

export const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
