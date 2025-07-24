# Node.js 20 버전 기반
FROM node:20

# 컨테이너 내 작업 디렉토리 지정
WORKDIR /app

# package.json 복사하여 의존성 설치
COPY package*.json ./
RUN npm install

# 나머지 소스 복사
COPY . .

# 앱에서 사용하는 포트 노출
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
