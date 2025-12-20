import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './OrderCompletePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function OrderCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  const { orderNumber, totalAmount } = location.state || {};

  useEffect(() => {
    if (!orderNumber) {
      navigate('/');
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="order-complete-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="order-complete-main">
        <div className="complete-card">
          <div className="complete-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#5f0080"/>
              <path 
                d="M24 40L35 51L56 30" 
                stroke="white" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h1 className="complete-title">주문이 완료되었습니다!</h1>
          <p className="complete-subtitle">주문해 주셔서 감사합니다.</p>

          <div className="order-info-card">
            <div className="info-row">
              <span className="info-label">주문번호</span>
              <span className="info-value order-number">{orderNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">결제금액</span>
              <span className="info-value total-amount">
                {totalAmount?.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="notice-box">
            <h3>📦 배송 안내</h3>
            <ul>
              <li>샛별배송 주문은 다음 날 아침 7시 전까지 도착합니다.</li>
              <li>배송 진행 상황은 주문 내역에서 확인하실 수 있습니다.</li>
              <li>주문 내역 및 배송 정보는 이메일로도 발송됩니다.</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={() => navigate('/')}>
              쇼핑 계속하기
            </button>
            <button className="primary-btn" onClick={() => navigate('/orders')}>
              주문 내역 보기
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderCompletePage;

