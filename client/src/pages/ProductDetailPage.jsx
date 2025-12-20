import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './ProductDetailPage.css';

const API_URL = 'http://localhost:5000/api';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 유저 정보 가져오기
        const token = localStorage.getItem('token');
        if (token) {
          const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userResponse.json();
          if (userData.success) {
            setUser(userData.data);
          }
        }

        // 상품 정보 가져오기
        const productResponse = await fetch(`${API_URL}/products/${id}`);
        const productData = await productResponse.json();
        
        if (productData.success) {
          setProduct(productData.data);
        } else {
          alert('상품을 찾을 수 없습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`${product.name} ${quantity}개가 장바구니에 담겼습니다.`);
        // Header의 카운트 업데이트를 위한 커스텀 이벤트 발생
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        alert(data.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <Header user={user} onLogout={handleLogout} />
        <div className="loading-wrapper">
          <p>상품 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="product-detail-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="product-detail-main">
        <div className="product-detail-content">
          {/* 왼쪽: 상품 이미지 */}
          <div className="product-image-section">
            <div className="main-image-wrapper">
              <img 
                src={product.image || '/placeholder-image.png'} 
                alt={product.name} 
                className="main-product-image"
              />
            </div>
            <div className="thumbnail-list">
              <button className="thumbnail-item active">
                <img src={product.image || '/placeholder-image.png'} alt="썸네일" />
              </button>
              <button className="thumbnail-item">사진</button>
              <button className="thumbnail-item">사진</button>
              <button className="thumbnail-item">사진</button>
            </div>
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="product-info-section">
            {/* 태그 배지 */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="detail-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* 상품명 */}
            <div className="product-title-row">
              <h1 className="product-title">{product.name}</h1>
              <button className="share-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16,6 12,2 8,6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
            </div>

            {/* 상품 설명 */}
            <p className="product-subtitle">{product.description || '맛있는 상품입니다'}</p>

            {/* 리뷰 */}
            <div className="product-rating">
              <span className="star">⭐</span>
              <span className="rating-score">4.8</span>
              <span className="review-count">(124 reviews)</span>
            </div>

            {/* 가격 */}
            <div className="product-price-section">
              <p className="original-price">{product.price.toLocaleString()}원</p>
              <div className="discount-price-row">
                <span className="discount-rate">38%</span>
                <span className="discount-price">{Math.floor(product.price * 0.62).toLocaleString()}원</span>
                <span className="first-buy-label">ⓘ 첫구매 최대혜택가 ▾</span>
              </div>
            </div>

            {/* 첫구매 쿠폰 배너 */}
            <button className="coupon-banner">
              <span className="coupon-icon">🎫</span>
              <span>첫구매 쿠폰 받고 <strong>{Math.floor(product.price * 0.62).toLocaleString()}원</strong>에 구매하기</span>
              <span className="arrow">›</span>
            </button>

            {/* 상품 정보 테이블 */}
            <div className="product-info-table">
              <div className="info-row">
                <span className="info-label">배송</span>
                <div className="info-value">
                  <strong className="delivery-type">샛별배송</strong>
                  <p className="delivery-desc">23시 전 주문 시 수도권/충청 내일 아침 7시 전 도착<br/>(그 외 지역 아침 8시 전 도착)</p>
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">판매자</span>
                <span className="info-value seller">컬리</span>
              </div>
              <div className="info-row">
                <span className="info-label">포장타입</span>
                <div className="info-value">
                  <strong>{product.category === '냉동' ? '냉동 (종이포장)' : product.category === '냉장' ? '냉장 (종이포장)' : '상온 (종이포장)'}</strong>
                  <p className="package-desc">택배배송은 에코 포장이 스티로폼으로 대체됩니다.</p>
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">판매단위</span>
                <span className="info-value">1팩</span>
              </div>
              <div className="info-row">
                <span className="info-label">중량/용량</span>
                <span className="info-value">1KG</span>
              </div>
              <div className="info-row">
                <span className="info-label">알레르기정보</span>
                <span className="info-value allergy">소고기, 대두, 밀, 우유 함유</span>
              </div>
              <div className="info-row">
                <span className="info-label">안내사항</span>
                <span className="info-value notice"><strong>뼈조각</strong>이 있을 수 있으니 <strong>섭취</strong> 시 주의부탁드립니다.</span>
              </div>
            </div>

            {/* 상품 선택 */}
            <div className="product-select-section">
              <span className="select-label">상품선택</span>
              <div className="select-box">
                <div className="selected-product">
                  <span className="selected-name">{product.name}</span>
                  <div className="quantity-control">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="selected-price">{product.price.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* 총 상품금액 */}
            <div className="total-price-section">
              <span className="total-label">총 상품금액 :</span>
              <span className="total-price">{totalPrice.toLocaleString()}<span className="won">원</span></span>
            </div>

            {/* 액션 버튼 */}
            <div className="action-buttons">
              <button className="wishlist-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button className="notify-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <button className="add-cart-btn" onClick={handleAddToCart}>
                장바구니 담기
              </button>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="product-tabs">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            상품설명
          </button>
          <button 
            className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            상세정보
          </button>
          <button 
            className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            후기 <span className="review-num">(209,340)</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'inquiry' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiry')}
          >
            문의
          </button>
        </div>

        {/* 탭 내용 */}
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h2>상품 설명</h2>
              <p>{product.description || '상품 설명이 없습니다.'}</p>
            </div>
          )}
          {activeTab === 'detail' && (
            <div className="detail-content">
              <h2>상세 정보</h2>
              <p>상세 정보가 준비 중입니다.</p>
            </div>
          )}
          {activeTab === 'review' && (
            <div className="review-content">
              <h2>상품 후기</h2>
              <p>아직 작성된 후기가 없습니다.</p>
            </div>
          )}
          {activeTab === 'inquiry' && (
            <div className="inquiry-content">
              <h2>상품 문의</h2>
              <p>아직 작성된 문의가 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;

