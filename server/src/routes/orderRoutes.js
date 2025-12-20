const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// 주문 생성 (로그인 필요)
router.post('/', protect, orderController.createOrder);

// 전체 주문 조회 (관리자용)
router.get('/', protect, admin, orderController.getAllOrders);

// 내 주문 조회 (로그인한 사용자 본인)
router.get('/my', protect, orderController.getMyOrders);

// 특정 사용자의 주문 조회 (로그인 필요)
router.get('/user/:userId', protect, orderController.getOrdersByUser);

// 주문 상세 조회 (로그인 필요)
router.get('/:id', protect, orderController.getOrderById);

// 주문 상태 업데이트 (관리자용)
router.patch('/:id/status', protect, admin, orderController.updateOrderStatus);

// 운송장 번호 등록 (관리자용)
router.patch('/:id/tracking', protect, admin, orderController.updateTrackingNumber);

// 주문 취소 (로그인 필요)
router.patch('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
