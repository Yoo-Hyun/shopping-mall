const User = require('../models/User');

// @desc    모든 유저 조회
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 목록 조회 실패',
      error: error.message,
    });
  }
};

// @desc    특정 유저 조회
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message,
    });
  }
};

// @desc    새 유저 생성
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다',
      });
    }

    const user = await User.create({
      email,
      name,
      password,
      user_type,
      address,
    });

    // 응답에서 비밀번호 제외
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: '유저 생성 성공',
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 생성 실패',
      error: error.message,
    });
  }
};

// @desc    유저 정보 수정
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다',
      });
    }

    // 이메일 변경 시 중복 확인
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 이메일입니다',
        });
      }
    }

    // 필드 업데이트
    if (email) user.email = email;
    if (name) user.name = name;
    if (password) user.password = password;
    if (user_type) user.user_type = user_type;
    if (address !== undefined) user.address = address;

    await user.save();

    // 응답에서 비밀번호 제외
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: '유저 정보 수정 성공',
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 정보 수정 실패',
      error: error.message,
    });
  }
};

// @desc    유저 삭제
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '유저 삭제 성공',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 삭제 실패',
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

