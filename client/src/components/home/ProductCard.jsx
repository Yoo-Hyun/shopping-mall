import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const API_URL = 'http://localhost:5000/api';

function ProductCard({ product, showRank = false }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // product.id 또는 product._id 사용
    const productId = product.id || product._id;
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const handleCartClick = async (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const productId = product.id || product._id;
    
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
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

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-wrapper">
        {showRank && product.rank && (
          <span className="rank-badge">{product.rank}</span>
        )}
        {!showRank && product.badge && (
          <span className={`product-badge ${product.badgeType || ''}`}>
            {product.badge}
          </span>
        )}
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <button className="cart-add-btn" onClick={handleCartClick}>담기</button>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="discount">{product.discount}%</span>
          <span className="price">{product.discountPrice.toLocaleString()}원</span>
        </div>
        <p className="original-price">{product.originalPrice.toLocaleString()}원</p>
      </div>
    </div>
  );
}

export default ProductCard;

