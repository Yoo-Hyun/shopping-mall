const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU는 필수입니다'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, '상품 이름은 필수입니다'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, '상품 가격은 필수입니다'],
      min: [0, '가격은 0 이상이어야 합니다'],
    },
    category: {
      type: String,
      required: [true, '카테고리는 필수입니다'],
      enum: {
        values: ['일반', '냉장', '냉동'],
        message: '카테고리는 일반, 냉장, 냉동 중 하나여야 합니다',
      },
    },
    image: {
      type: String,
      required: false,
      default: '',
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// SKU 인덱스 생성
productSchema.index({ sku: 1 }, { unique: true });

// tags 인덱스 생성 (검색 성능 향상)
productSchema.index({ tags: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

