const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 장바구니 조회
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price image category sku'
    );

    // 장바구니가 없으면 빈 장바구니 생성
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 조회 실패',
      error: error.message,
    });
  }
};

// 장바구니에 상품 추가
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다',
      });
    }

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // 기존 상품 확인
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // 상품 정보 포함하여 반환
    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price image category sku'
    );

    res.status(201).json({
      success: true,
      message: '상품이 장바구니에 추가되었습니다',
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '장바구니 추가 실패',
      error: error.message,
    });
  }
};

// 장바구니 상품 수량 수정
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: '수량은 1개 이상이어야 합니다',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다',
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '장바구니에 해당 상품이 없습니다',
      });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price image category sku'
    );

    res.json({
      success: true,
      message: '수량이 변경되었습니다',
      data: updatedCart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '수량 변경 실패',
      error: error.message,
    });
  }
};

// 장바구니에서 상품 제거
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '장바구니에 해당 상품이 없습니다',
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price image category sku'
    );

    res.json({
      success: true,
      message: '상품이 장바구니에서 제거되었습니다',
      data: updatedCart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '상품 제거 실패',
      error: error.message,
    });
  }
};

// 장바구니 비우기
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다',
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: '장바구니가 비워졌습니다',
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '장바구니 비우기 실패',
      error: error.message,
    });
  }
};

