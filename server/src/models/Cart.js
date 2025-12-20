const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '상품 정보는 필수입니다'],
  },
  quantity: {
    type: Number,
    required: [true, '수량은 필수입니다'],
    min: [1, '수량은 1개 이상이어야 합니다'],
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    // 장바구니 소유자
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '사용자 정보는 필수입니다'],
      unique: true,
    },

    // 장바구니 아이템 목록
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// 사용자별 장바구니 조회를 위한 인덱스
cartSchema.index({ user: 1 }, { unique: true });

// 장바구니 총 금액 계산 가상 필드 (populate 후 사용 가능)
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);
});

// 장바구니 총 아이템 수 계산 가상 필드
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// JSON 변환 시 가상 필드 포함
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

// 장바구니에 상품 추가 메서드
cartSchema.methods.addItem = function (productId, quantity = 1) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }

  return this.save();
};

// 장바구니에서 상품 제거 메서드
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// 장바구니 상품 수량 업데이트 메서드
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }
    item.quantity = quantity;
  }

  return this.save();
};

// 장바구니 비우기 메서드
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

