import swaggerAutogen from 'swagger-autogen';
import swaggerUi from 'swagger-ui-express';

const swaggerMiddleware = async (app) => {
  const options = {
    openapi: '3.0.0',
    disableLogs: true,
    writeOutputFile: false,
  };

  const outputFile = '/dev/null'; // 실제 파일 저장 X
  const routes = ['./src/app.js']; // Swagger 주석을 읽을 진입점 파일
  const doc = {
    info: {
      title: 'TimeUp API Docs',
      description: 'TimeUp 프로젝트의 백엔드 API 문서입니다.',
    },
    // host 생략: 포트 번호 아직 미정
  };

  const result = await swaggerAutogen(options)(outputFile, routes, doc);

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(result.data, {
      swaggerOptions: {
        url: '/openapi.json',
      },
    })
  );

  app.get('/openapi.json', (req, res) => {
    // #swagger.ignore = true
    res.json(result.data);
  });
};

export default swaggerMiddleware;