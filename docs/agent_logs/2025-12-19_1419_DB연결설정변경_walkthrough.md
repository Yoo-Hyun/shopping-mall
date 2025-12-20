# 변경 사항 요약 (Walkthrough)

`server/src/config/db.js` 파일의 데이터베이스 연결 로직을 수정했습니다.

## 변경 내용
- **연결 URL 우선순위 적용**:
  1. `process.env.MONGDB_ATLAS_URL` (최우선)
  2. `process.env.MONGODB_URI`
  3. 로컬 기본값 (`mongodb://127.0.0.1:27017/shoping-mall`)
- **로그 개선**: 연결 시도 시 Local DB인지 Remote(Atlas) DB인지 구분하여 콘솔에 출력하도록 추가했습니다.

## 검증 결과
- 코드가 수정되었으며, 서버 재시작 시 설정된 환경변수에 따라 적절한 DB URL을 선택하게 됩니다.
