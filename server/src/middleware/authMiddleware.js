const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 검증 미들웨어
const protect = async (req, res, next) => {
  let token;

  // Authorization 헤더에서 Bearer 토큰 추출
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 토큰 추출 (Bearer 제거)
      token = req.headers.authorization.split(' ')[1];

      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 유저 정보를 req에 저장 (비밀번호 제외)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '유저를 찾을 수 없습니다',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '인증이 유효하지 않습니다',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 없습니다',
    });
  }
};

// 관리자 권한 확인 미들웨어
const admin = (req, res, next) => {
  if (req.user && req.user.user_type === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다',
    });
  }
};

module.exports = { protect, admin };

