import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const API_URL = 'http://localhost:5000/api';

// 장바구니 카운트를 가져오는 유틸리티 함수
const fetchCartCountFromAPI = async () => {
  const token = localStorage.getItem('token');
  if (!token) return 0;

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success && data.data.items) {
      return data.data.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
  }
  return 0;
};

function Header({ user, onLogout, cartCount: propCartCount }) {
  const navigate = useNavigate();
  const [internalCartCount, setInternalCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMountedRef = useRef(true);
  const dropdownRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // propCartCount가 있으면 그것을 사용, 없으면 내부 state 사용
  const cartCount = propCartCount !== undefined ? propCartCount : (user ? internalCartCount : 0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // props로 전달된 cartCount가 있으면 API 호출 불필요
    if (propCartCount !== undefined) return;
    if (!user) return;
    
    // 로그인된 유저가 있으면 장바구니 카운트 가져오기
    const loadCartCount = async () => {
      const count = await fetchCartCountFromAPI();
      if (isMountedRef.current) {
        setInternalCartCount(count);
      }
    };

    loadCartCount();
  }, [user, propCartCount]);

  // 장바구니 업데이트 이벤트 리스너
  useEffect(() => {
    const handleCartUpdate = async () => {
      if (propCartCount !== undefined) return;
      
      const count = await fetchCartCountFromAPI();
      if (isMountedRef.current) {
        setInternalCartCount(count);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [propCartCount]);

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-top-inner">
          <div className="header-links">
            {user?.user_type === 'admin' && (
              <a href="/admin" className="header-link admin-link">관리자</a>
            )}
            <a href="#" className="header-link">고객센터</a>
          </div>
        </div>
      </div>
      
      <div className="header-main">
        <div className="header-main-inner">
          <div className="logo-section">
            <h1 className="logo" onClick={() => navigate('/')}>
              <span className="logo-icon">🛒</span>
              <span className="logo-text">마켓</span>
            </h1>
            <div className="market-tabs">
              <button className="market-tab active">마켓컬리</button>
            </div>
          </div>

          <div className="search-section">
            <input 
              type="text" 
              className="search-input" 
              placeholder="검색어를 입력해주세요"
            />
            <button className="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          <div className="header-icons">
            {user ? (
              <div className="user-dropdown" ref={dropdownRef}>
                <button 
                  className="user-dropdown-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="welcome-text">{user.name}님</span>
                  <svg 
                    className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/my-orders');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                        <path d="M9 12h6M9 16h6"/>
                      </svg>
                      내 주문 목록
                    </button>
                    <button 
                      className="dropdown-item logout"
                      onClick={() => {
                        onLogout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>
                로그인
              </button>
            )}
            <button className="icon-btn cart-btn" onClick={() => navigate('/cart')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* 카테고리 네비게이션 */}
      <nav className="category-nav">
        <div className="category-nav-inner">
          <button className="category-menu-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
            카테고리
          </button>
          <div className="nav-links">
            <a href="#" className="nav-link">신상품</a>
            <a href="#" className="nav-link">베스트</a>
            <a href="#" className="nav-link">알뜰쇼핑</a>
            <a href="#" className="nav-link">특가/혜택</a>
          </div>
          <div className="nav-right">
            <a href="#" className="nav-link highlight">특가혜택</a>
            <span className="nav-divider">|</span>
            <a href="#" className="nav-link notice">샛별마감 <span className="notice-time">오후 4시</span></a>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

