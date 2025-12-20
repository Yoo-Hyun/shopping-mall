const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, '이메일은 필수입니다'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, '이름은 필수입니다'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, '비밀번호는 필수입니다'],
    },
    user_type: {
      type: String,
      required: [true, '유저 타입은 필수입니다'],
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    address: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// 비밀번호 해싱 미들웨어 (저장 전 실행)
userSchema.pre('save', async function (next) {
  // 비밀번호가 수정되지 않았으면 스킵
  if (!this.isModified('password')) {
    return next();
  }

  // 비밀번호 해싱
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 비밀번호 비교 메서드
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

