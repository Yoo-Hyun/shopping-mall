const Order = require('../models/Order');
const Product = require('../models/Product');

// 포트원 결제 검증 함수
const verifyPayment = async (impUid, expectedAmount) => {
  try {
    // 1. 포트원 액세스 토큰 발급
    const tokenResponse = await fetch('https://api.iamport.kr/users/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imp_key: process.env.PORTONE_API_KEY,
        imp_secret: process.env.PORTONE_API_SECRET,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.code !== 0) {
      return { success: false, message: '결제 검증 토큰 발급 실패' };
    }
    
    const accessToken = tokenData.response.access_token;
    
    // 2. 포트원에서 결제 정보 조회
    const paymentResponse = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
      method: 'GET',
      headers: { 'Authorization': accessToken },
    });
    
    const paymentData = await paymentResponse.json();
    
    if (paymentData.code !== 0) {
      return { success: false, message: '결제 정보 조회 실패' };
    }
    
    const payment = paymentData.response;
    
    // 3. 결제 상태 확인
    if (payment.status !== 'paid') {
      return { 
        success: false, 
        message: `결제가 완료되지 않았습니다. 상태: ${payment.status}` 
      };
    }
    
    // 4. 결제 금액 검증
    if (payment.amount !== expectedAmount) {
      return { 
        success: false, 
        message: `결제 금액이 일치하지 않습니다. 예상: ${expectedAmount}, 실제: ${payment.amount}` 
      };
    }
    
    return { 
      success: true, 
      payment: {
        impUid: payment.imp_uid,
        merchantUid: payment.merchant_uid,
        amount: payment.amount,
        status: payment.status,
        payMethod: payment.pay_method,
        paidAt: payment.paid_at,
      }
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, message: '결제 검증 중 오류 발생' };
  }
};

// 주문 생성
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, payment, shippingFee = 0, discountAmount = 0 } = req.body;
    
    // 인증된 사용자 정보 사용 (req.body.user는 무시)
    const user = req.user._id;

    // 1. 주문 중복 체크 (impUid 기준)
    if (payment.impUid) {
      const existingOrderByImpUid = await Order.findOne({ 'payment.impUid': payment.impUid });
      if (existingOrderByImpUid) {
        return res.status(400).json({
          success: false,
          message: '이미 처리된 결제입니다.',
          data: { orderNumber: existingOrderByImpUid.orderNumber }
        });
      }
    }

    // 2. 주문 중복 체크 (merchantUid 기준)
    if (payment.merchantUid) {
      const existingOrderByMerchantUid = await Order.findOne({ 'payment.merchantUid': payment.merchantUid });
      if (existingOrderByMerchantUid) {
        return res.status(400).json({
          success: false,
          message: '이미 처리된 주문입니다.',
          data: { orderNumber: existingOrderByMerchantUid.orderNumber }
        });
      }
    }

    // 3. 상품 정보 조회 및 금액 계산
    let totalItemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `상품을 찾을 수 없습니다: ${item.product}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      totalItemsPrice += product.price * item.quantity;
    }

    const totalAmount = totalItemsPrice + shippingFee - discountAmount;

    // 4. 결제 검증 (impUid가 있는 경우)
    let verifiedPayment = null;
    if (payment.impUid && process.env.PORTONE_API_KEY && process.env.PORTONE_API_SECRET) {
      const verificationResult = await verifyPayment(payment.impUid, totalAmount);
      
      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message,
        });
      }
      
      verifiedPayment = verificationResult.payment;
    }

    // 5. 결제 완료 여부에 따라 상태 설정
    const isPaid = payment.status === 'paid' || payment.impUid;
    
    const order = new Order({
      user,
      items: orderItems,
      shippingAddress,
      payment: {
        method: payment.method,
        status: isPaid ? 'completed' : 'pending',
        impUid: verifiedPayment?.impUid || payment.impUid || '',
        merchantUid: verifiedPayment?.merchantUid || payment.merchantUid || '',
        paidAmount: verifiedPayment?.amount || payment.paidAmount || totalAmount,
        paidAt: isPaid ? new Date(verifiedPayment?.paidAt * 1000 || Date.now()) : undefined,
      },
      status: isPaid ? 'paid' : 'pending',
      totalItemsPrice,
      shippingFee,
      discountAmount,
      totalAmount,
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: '주문이 생성되었습니다',
      data: savedOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: '주문 생성 실패',
      error: error.message,
    });
  }
};

// 전체 주문 조회 (관리자용)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message,
    });
  }
};

// 특정 사용자의 주문 조회
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product', 'name sku image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message,
    });
  }
};

// 내 주문 조회 (로그인한 사용자 본인)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name sku image price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message,
    });
  }
};

// 주문 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name sku image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message,
    });
  }
};

// 주문 상태 업데이트
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다',
      });
    }

    order.status = status;

    // 상태에 따른 추가 처리
    if (status === 'paid') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
    } else if (status === 'refunded') {
      order.payment.status = 'refunded';
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: '주문 상태가 업데이트되었습니다',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '주문 상태 업데이트 실패',
      error: error.message,
    });
  }
};

// 운송장 번호 등록
exports.updateTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        trackingNumber,
        status: 'shipping',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      message: '운송장 번호가 등록되었습니다',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '운송장 번호 등록 실패',
      error: error.message,
    });
  }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다',
      });
    }

    // 배송중이거나 배송완료된 주문은 취소 불가
    if (['shipping', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '배송중이거나 배송완료된 주문은 취소할 수 없습니다',
      });
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason || '';
    order.cancelledAt = new Date();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: '주문이 취소되었습니다',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '주문 취소 실패',
      error: error.message,
    });
  }
};

