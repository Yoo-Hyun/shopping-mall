# Shopping Mall Server

Node.js, Express, MongoDB를 사용한 쇼핑몰 백엔드 서버입니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 3. MongoDB 실행

로컬에서 MongoDB가 실행 중인지 확인하세요. 또는 MongoDB Atlas 등 클라우드 서비스를 사용할 수 있습니다.

### 4. 서버 실행

**개발 모드** (자동 재시작):
```bash
npm run dev
```

**프로덕션 모드**:
```bash
npm start
```

## 프로젝트 구조

```
server/
├── src/
│   ├── config/         # 설정 파일 (DB 연결 등)
│   ├── controllers/    # 비즈니스 로직
│   ├── middleware/     # 커스텀 미들웨어
│   ├── models/         # Mongoose 모델
│   ├── routes/         # API 라우트
│   └── index.js        # 앱 진입점
├── .env.example        # 환경 변수 예시
├── .gitignore
├── package.json
└── README.md
```

## API 엔드포인트

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | 서버 상태 확인 |
| GET | `/api` | API 정보 |

## 라이선스

ISC

