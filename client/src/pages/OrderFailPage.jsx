import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './OrderFailPage.css';

const API_URL = 'http://localhost:5000/api';

function OrderFailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  const { errorMessage, errorCode } = location.state || {};

  useEffect(() => {
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
    <div className="order-fail-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="order-fail-main">
        <div className="fail-card">
          {/* 실패 아이콘 */}
          <div className="fail-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#ef4444"/>
              <path 
                d="M28 28L52 52M52 28L28 52" 
                stroke="white" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h1 className="fail-title">주문에 실패했습니다</h1>
          <p className="fail-subtitle">결제 처리 중 문제가 발생했습니다.</p>

          {/* 에러 정보 */}
          {errorMessage && (
            <div className="error-info-card">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <p className="error-label">오류 내용</p>
                <p className="error-message">{errorMessage}</p>
                {errorCode && (
                  <p className="error-code">오류 코드: {errorCode}</p>
                )}
              </div>
            </div>
          )}

          {/* 안내 박스 */}
          <div className="help-box">
            <h3>❓ 이런 경우 확인해 주세요</h3>
            <ul>
              <li>카드 한도가 충분한지 확인해 주세요.</li>
              <li>카드 정보가 정확하게 입력되었는지 확인해 주세요.</li>
              <li>결제 비밀번호를 다시 확인해 주세요.</li>
              <li>문제가 지속되면 카드사에 문의해 주세요.</li>
            </ul>
          </div>

          {/* 고객센터 안내 */}
          <div className="support-box">
            <p className="support-text">
              결제 관련 문의사항이 있으시면 고객센터로 연락해 주세요.
            </p>
            <p className="support-number">📞 1588-0000</p>
            <p className="support-hours">운영시간: 평일 09:00 - 18:00</p>
          </div>

          {/* 액션 버튼 */}
          <div className="action-buttons">
            <button className="secondary-btn" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </button>
            <button className="primary-btn" onClick={() => navigate('/cart')}>
              다시 결제하기
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderFailPage;

