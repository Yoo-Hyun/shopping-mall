const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // 주문 번호 (고유 식별자) - pre('save') 훅에서 자동 생성됨
    orderNumber: {
      type: String,
      unique: true,
    },

    // 주문자 정보
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '주문자 정보는 필수입니다'],
    },

    // 주문 상품 목록
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, '수량은 1개 이상이어야 합니다'],
        },
      },
    ],

    // 배송 정보
    shippingAddress: {
      recipientName: {
        type: String,
        required: [true, '받는 사람 이름은 필수입니다'],
      },
      phone: {
        type: String,
        required: [true, '연락처는 필수입니다'],
      },
      zipCode: {
        type: String,
        required: [true, '우편번호는 필수입니다'],
      },
      address: {
        type: String,
        required: [true, '주소는 필수입니다'],
      },
      addressDetail: {
        type: String,
        default: '',
      },
      memo: {
        type: String,
        default: '',
      },
    },

    // 결제 정보
    payment: {
      method: {
        type: String,
        enum: {
          values: ['card', 'bank_transfer', 'kakao_pay', 'naver_pay'],
          message: '유효하지 않은 결제 방법입니다',
        },
        required: [true, '결제 방법은 필수입니다'],
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      impUid: {
        type: String,
        default: '',
      },
      merchantUid: {
        type: String,
        default: '',
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      paidAt: {
        type: Date,
      },
    },

    // 금액 정보
    totalItemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 주문 상태
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'paid',
          'preparing',
          'shipping',
          'delivered',
          'cancelled',
          'refund_requested',
          'refunded',
        ],
        message: '유효하지 않은 주문 상태입니다',
      },
      default: 'pending',
    },

    // 배송 정보
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      default: '',
    },

    // 취소/환불 정보
    cancelReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 주문번호 인덱스
orderSchema.index({ orderNumber: 1 }, { unique: true });

// 사용자별 주문 조회를 위한 인덱스
orderSchema.index({ user: 1, createdAt: -1 });

// 주문 상태별 조회를 위한 인덱스
orderSchema.index({ status: 1 });

// 주문번호 자동 생성 (저장 전)
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 오늘 날짜의 마지막 주문번호 조회
    const lastOrder = await this.constructor
      .findOne({ orderNumber: new RegExp(`^ORD-${dateStr}-`) })
      .sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    this.orderNumber = `ORD-${dateStr}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

