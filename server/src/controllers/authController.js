const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 생성 함수
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // 7일간 유효
  });
};

// @desc    로그인
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일, 비밀번호 입력 확인
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요',
      });
    }

    // 이메일로 유저 찾기
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다',
      });
    }

    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다',
      });
    }

    // 토큰 생성 및 응답
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '로그인 실패',
      error: error.message,
    });
  }
};

// @desc    내 정보 조회
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 정보 조회 실패',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getMe,
};

