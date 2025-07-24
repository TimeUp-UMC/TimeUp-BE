FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# package.json, lock파일 복사 → 종속성 설치
COPY package*.json ./
RUN npm install

# Prisma Client 생성
COPY prisma ./prisma
RUN npx prisma generate

# 나머지 소스 복사 (마지막에)
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
