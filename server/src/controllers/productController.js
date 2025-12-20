const Product = require('../models/Product');

// @desc    모든 상품 조회 (페이지네이션 지원)
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    
    // 필터 구성
    const filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag; // 태그 필터링
    
    // 페이지네이션 계산
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // 전체 상품 수 조회
    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);
    
    // 페이지네이션 적용하여 상품 조회
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      success: true,
      count: products.length,
      totalCount,
      totalPages,
      currentPage: pageNum,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 목록 조회 실패',
      error: error.message,
    });
  }
};

// @desc    태그로 상품 조회
// @route   GET /api/products/tag/:tag
const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ tags: tag })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message,
    });
  }
};

// @desc    특정 상품 조회
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message,
    });
  }
};

// @desc    SKU로 상품 조회
// @route   GET /api/products/sku/:sku
const getProductBySku = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message,
    });
  }
};

// @desc    새 상품 생성
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description, tags } = req.body;

    // SKU 중복 확인
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 SKU입니다',
      });
    }

    const product = await Product.create({
      sku,
      name,
      price,
      category,
      image,
      description,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: '상품 생성 성공',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 생성 실패',
      error: error.message,
    });
  }
};

// @desc    상품 정보 수정
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description, tags } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다',
      });
    }

    // SKU 변경 시 중복 확인
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다',
        });
      }
    }

    // 필드 업데이트
    if (sku) product.sku = sku;
    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description;
    if (tags !== undefined) product.tags = tags;

    await product.save();

    res.json({
      success: true,
      message: '상품 정보 수정 성공',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 정보 수정 실패',
      error: error.message,
    });
  }
};

// @desc    상품 삭제
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '상품 삭제 성공',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 삭제 실패',
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySku,
  getProductsByTag,
  createProduct,
  updateProduct,
  deleteProduct,
};

