import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './MyOrdersPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 주문 상태 한글 변환
const getStatusText = (status) => {
  const statusMap = {
    pending: '결제대기',
    paid: '결제완료',
    preparing: '상품준비중',
    shipping: '배송중',
    delivered: '배송완료',
    cancelled: '주문취소',
    refund_requested: '환불요청',
    refunded: '환불완료'
  };
  return statusMap[status] || status;
};

// 주문 상태 색상
const getStatusColor = (status) => {
  const colorMap = {
    pending: '#ff9800',
    paid: '#5f0080',
    preparing: '#2196f3',
    shipping: '#4caf50',
    delivered: '#8bc34a',
    cancelled: '#f44336',
    refund_requested: '#ff5722',
    refunded: '#9e9e9e'
  };
  return colorMap[status] || '#666';
};

// 날짜 포맷
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

function MyOrdersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');

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

      // 내 주문 목록 가져오기
      const ordersResponse = await fetch(`${API_URL}/orders/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersResponse.json();
      
      if (ordersData.success) {
        setOrders(ordersData.data);
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
    navigate('/login');
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('정말 주문을 취소하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cancelReason: '고객 요청' })
      });

      const data = await response.json();
      if (data.success) {
        alert('주문이 취소되었습니다.');
        fetchData(); // 목록 새로고침
      } else {
        alert(data.message || '주문 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('주문 취소 중 오류가 발생했습니다.');
    }
  };

  // 탭별 필터링
  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'ongoing') return ['pending', 'paid', 'preparing', 'shipping'].includes(order.status);
    if (selectedTab === 'completed') return order.status === 'delivered';
    if (selectedTab === 'cancelled') return ['cancelled', 'refund_requested', 'refunded'].includes(order.status);
    return true;
  });

  // 주문 상태별 카운트
  const orderCounts = {
    all: orders.length,
    ongoing: orders.filter(o => ['pending', 'paid', 'preparing', 'shipping'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => ['cancelled', 'refund_requested', 'refunded'].includes(o.status)).length
  };

  if (loading) {
    return (
      <div className="my-orders-container">
        <Header user={user} onLogout={handleLogout} />
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>주문 내역을 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="my-orders-main">
        <div className="page-header">
          <h1 className="page-title">주문 내역</h1>
          <p className="page-subtitle">총 {orders.length}건의 주문이 있습니다</p>
        </div>

        {/* 주문 진행 현황 */}
        <div className="order-progress-section">
          <div className="progress-cards">
            <div className="progress-card">
              <div className="progress-icon pending">🕐</div>
              <div className="progress-info">
                <span className="progress-count">{orders.filter(o => o.status === 'pending').length}</span>
                <span className="progress-label">결제대기</span>
              </div>
            </div>
            <div className="progress-arrow">→</div>
            <div className="progress-card">
              <div className="progress-icon paid">💳</div>
              <div className="progress-info">
                <span className="progress-count">{orders.filter(o => o.status === 'paid').length}</span>
                <span className="progress-label">결제완료</span>
              </div>
            </div>
            <div className="progress-arrow">→</div>
            <div className="progress-card">
              <div className="progress-icon preparing">📦</div>
              <div className="progress-info">
                <span className="progress-count">{orders.filter(o => o.status === 'preparing').length}</span>
                <span className="progress-label">상품준비</span>
              </div>
            </div>
            <div className="progress-arrow">→</div>
            <div className="progress-card">
              <div className="progress-icon shipping">🚚</div>
              <div className="progress-info">
                <span className="progress-count">{orders.filter(o => o.status === 'shipping').length}</span>
                <span className="progress-label">배송중</span>
              </div>
            </div>
            <div className="progress-arrow">→</div>
            <div className="progress-card">
              <div className="progress-icon delivered">✅</div>
              <div className="progress-info">
                <span className="progress-count">{orders.filter(o => o.status === 'delivered').length}</span>
                <span className="progress-label">배송완료</span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="order-tabs">
          <button 
            className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-text">전체</span>
            <span className="tab-count">{orderCounts.all}</span>
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setSelectedTab('ongoing')}
          >
            <span className="tab-icon">⏳</span>
            <span className="tab-text">진행중</span>
            <span className="tab-count">{orderCounts.ongoing}</span>
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'completed' ? 'active' : ''}`}
            onClick={() => setSelectedTab('completed')}
          >
            <span className="tab-icon">🎉</span>
            <span className="tab-text">배송완료</span>
            <span className="tab-count">{orderCounts.completed}</span>
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setSelectedTab('cancelled')}
          >
            <span className="tab-icon">↩️</span>
            <span className="tab-text">취소/환불</span>
            <span className="tab-count">{orderCounts.cancelled}</span>
          </button>
        </div>

        {/* 주문 목록 */}
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <p className="empty-text">주문 내역이 없습니다</p>
            <button className="shop-btn" onClick={() => navigate('/')}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                {/* 주문 헤더 */}
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                    <span className="order-number">{order.orderNumber}</span>
                  </div>
                  <span 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* 주문 상품 */}
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div 
                        className="item-image"
                        onClick={() => navigate(`/product/${item.product?._id}`)}
                      >
                        <img 
                          src={item.product?.image || '/placeholder-image.png'} 
                          alt={item.name} 
                        />
                      </div>
                      <div className="item-details">
                        <p 
                          className="item-name"
                          onClick={() => navigate(`/product/${item.product?._id}`)}
                        >
                          {item.name}
                        </p>
                        <p className="item-option">
                          {item.price.toLocaleString()}원 · {item.quantity}개
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 주문 푸터 (결제금액 + 액션 버튼) */}
                <div className="order-footer">
                  <div className="footer-left">
                    <span className="total-label">결제금액</span>
                    <span className="total-amount">{order.totalAmount.toLocaleString()}원</span>
                    {order.trackingNumber && (
                      <span className="tracking-number">
                        운송장: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                  <div className="footer-right">
                    <button 
                      className="action-btn secondary"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      주문 상세
                    </button>
                    {['pending', 'paid'].includes(order.status) && (
                      <button 
                        className="action-btn cancel"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        주문 취소
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="action-btn primary">
                        리뷰 작성
                      </button>
                    )}
                    {order.status === 'shipping' && order.trackingNumber && (
                      <button className="action-btn primary">
                        배송 조회
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MyOrdersPage;

