const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// 모든 장바구니 라우트는 인증 필요
router.use(protect);

// GET /api/cart - 장바구니 조회
// POST /api/cart - 장바구니에 상품 추가
// DELETE /api/cart - 장바구니 비우기
router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// PUT /api/cart/:productId - 상품 수량 수정
// DELETE /api/cart/:productId - 상품 제거
router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;

