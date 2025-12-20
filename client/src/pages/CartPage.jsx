import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './CartPage.css';

const API_URL = 'http://localhost:5000/api';

function CartPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      // 유저 정보 가져오기
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      if (userData.success) {
        setUser(userData.data);
      }

      // 장바구니 정보 가져오기
      const cartResponse = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cartData = await cartResponse.json();
      
      if (cartData.success) {
        setCart(cartData.data);
        // 모든 아이템 선택 상태로 초기화
        setSelectedItems(cartData.data.items.map(item => item.product._id));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!confirm('상품을 장바구니에서 삭제하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        setSelectedItems(prev => prev.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (!cart || !cart.items) return;
    
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(item => item.product._id));
    }
  };

  const getSelectedItemsTotal = () => {
    if (!cart || !cart.items) return 0;
    
    return cart.items
      .filter(item => selectedItems.includes(item.product._id))
      .reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getSelectedItemsCount = () => {
    if (!cart || !cart.items) return 0;
    
    return cart.items
      .filter(item => selectedItems.includes(item.product._id))
      .reduce((total, item) => total + item.quantity, 0);
  };

  const shippingFee = getSelectedItemsTotal() >= 40000 ? 0 : 3000;
  const totalPrice = getSelectedItemsTotal() + shippingFee;

  if (loading) {
    return (
      <div className="cart-container">
        <Header user={user} onLogout={handleLogout} />
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>장바구니를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="cart-main">
        <h1 className="cart-title">장바구니</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <p className="empty-text">장바구니에 담긴 상품이 없습니다</p>
            <button className="shop-btn" onClick={() => navigate('/')}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="cart-content">
            {/* 왼쪽: 장바구니 아이템 목록 */}
            <div className="cart-items-section">
              {/* 전체 선택 */}
              <div className="cart-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cart.items.length}
                    onChange={handleSelectAll}
                  />
                  <span className="checkbox-custom"></span>
                  <span>전체선택 ({selectedItems.length}/{cart.items.length})</span>
                </label>
                <button className="delete-selected-btn" onClick={handleClearCart}>
                  전체삭제
                </button>
              </div>

              {/* 냉장/냉동/상온 구분 */}
              <div className="delivery-section">
                <div className="delivery-header">
                  <span className="delivery-icon">🚚</span>
                  <span className="delivery-title">샛별배송</span>
                </div>

                {/* 아이템 목록 */}
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="cart-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.product._id)}
                          onChange={() => handleSelectItem(item.product._id)}
                        />
                        <span className="checkbox-custom"></span>
                      </label>

                      <div className="item-image" onClick={() => navigate(`/product/${item.product._id}`)}>
                        <img 
                          src={item.product.image || '/placeholder-image.png'} 
                          alt={item.product.name} 
                        />
                      </div>

                      <div className="item-info">
                        <p className="item-name" onClick={() => navigate(`/product/${item.product._id}`)}>
                          {item.product.name}
                        </p>
                        <p className="item-price">{item.product.price.toLocaleString()}원</p>
                        
                        <div className="quantity-control">
                          <button 
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="item-total">
                        <p className="total-price">{(item.product.price * item.quantity).toLocaleString()}원</p>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.product._id)}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽: 결제 정보 */}
            <div className="cart-summary-section">
              <div className="cart-summary">
                <div className="summary-row">
                  <span>상품금액</span>
                  <span>{getSelectedItemsTotal().toLocaleString()}원</span>
                </div>
                <div className="summary-row">
                  <span>상품할인금액</span>
                  <span className="discount">0원</span>
                </div>
                <div className="summary-row">
                  <span>배송비</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="free-shipping">무료</span>
                    ) : (
                      `+${shippingFee.toLocaleString()}원`
                    )}
                  </span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>결제예정금액</span>
                  <span className="total-amount">{totalPrice.toLocaleString()}원</span>
                </div>

                {getSelectedItemsTotal() > 0 && getSelectedItemsTotal() < 40000 && (
                  <p className="shipping-notice">
                    {(40000 - getSelectedItemsTotal()).toLocaleString()}원 추가주문 시, <strong>무료배송</strong>
                  </p>
                )}

                <button 
                  className="order-btn"
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    const selectedCartItems = cart.items.filter(item => 
                      selectedItems.includes(item.product._id)
                    );
                    navigate('/order', {
                      state: {
                        items: selectedCartItems,
                        totalItemsPrice: getSelectedItemsTotal(),
                        shippingFee: shippingFee
                      }
                    });
                  }}
                >
                  주문하기 ({getSelectedItemsCount()}개)
                </button>

                <ul className="summary-info">
                  <li>쿠폰/적립금은 주문서에서 사용 가능합니다</li>
                  <li>'주문하기' 버튼을 누르시면 결제 페이지로 이동합니다</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CartPage;

