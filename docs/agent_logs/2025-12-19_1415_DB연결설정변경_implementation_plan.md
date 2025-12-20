# 구현 계획서 (Implementation Plan)

## 사용자 요청 내용
- `server/src/config/db.js`에서 MongoDB 연결 시 `MONGDB_ATLAS_URL` 환경변수를 우선 사용하도록 수정.
- `MONGDB_ATLAS_URL` 값이 없을 경우에만 로컬 주소(기존 설정 등)를 사용.

## User Review Required
- [NOTE] 로컬 주소의 폴백(Fallback) 값으로 `process.env.MONGODB_URI` 또는 기본 로컬호스트 주소(`mongodb://127.0.0.1:27017/shoping-mall`)를 사용할 예정입니다. 명시적인 로컬 주소가 있다면 확인이 필요합니다.

## Proposed Changes

### Server Configuration

#### [MODIFY] [db.js](file:///k:/coding/vibe-coding/Shoping-mall/server/src/config/db.js)
- `mongoose.connect` 호출 시 연결 문자열 결정 로직 변경.
- 우선순위: `process.env.MONGDB_ATLAS_URL` > `process.env.MONGODB_URI` > `'mongodb://127.0.0.1:27017/shoping-mall'` (기본값)
- 연결 성공/실패 로그에 어떤 URL을 시도했는지(안전을 위해 마스킹 처리 혹은 구분) 로그 추가 고려.

## Verification Plan

### Automated Tests
- 자동화된 테스트는 포함하지 않음 (환경변수 의존적).

### Manual Verification
1. `.env` 파일에 `MONGDB_ATLAS_URL`이 설정된 경우 Atlas로 연결되는지 서버 로그 확인.
2. `.env` 파일에서 `MONGDB_ATLAS_URL`을 주석 처리한 경우 로컬 주소로 연결 시도하는지 확인.
