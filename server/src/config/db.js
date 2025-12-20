const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 우선순위: Atlas URL > 기본 MONGODB_URI > 로컬 폴백
    const dbUrl = process.env.MONGODB_ATLAS_URI
    
    // 연결 URL 로깅 (보안을 위해 전체 URL 출력은 자제하거나 필요시 디버그용으로만 사용)
    const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    console.log(`MongoDB 연결 시도: ${isLocal ? 'Local DB' : 'Atlas/Remote DB'}`);

    await mongoose.connect(dbUrl);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

