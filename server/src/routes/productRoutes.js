const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductBySku,
  getProductsByTag,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/products - 모든 상품 조회 (공개)
// POST /api/products - 새 상품 생성 (관리자만)
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// GET /api/products/sku/:sku - SKU로 상품 조회 (공개)
router.get('/sku/:sku', getProductBySku);

// GET /api/products/tag/:tag - 태그로 상품 조회 (공개)
router.get('/tag/:tag', getProductsByTag);

// GET /api/products/:id - 특정 상품 조회 (공개)
// PUT /api/products/:id - 상품 정보 수정 (관리자만)
// DELETE /api/products/:id - 상품 삭제 (관리자만)
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;

