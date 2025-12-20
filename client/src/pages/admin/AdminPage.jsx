import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 더미 데이터
const statsData = [
  { id: 1, label: '총 주문', value: '1,234', change: '+12%', changeText: 'from last month', icon: 'cart', color: '#f59e0b' },
  { id: 2, label: '총 상품', value: '156', change: '+3%', changeText: 'from last month', icon: 'product', color: '#84cc16' },
  { id: 3, label: '총 고객', value: '2,345', change: '+8%', changeText: 'from last month', icon: 'users', color: '#a855f7' },
  { id: 4, label: '총 매출', value: '$45,678', change: '+15%', changeText: 'from last month', icon: 'revenue', color: '#3b82f6' },
];

const recentOrders = [
  { id: 'ORD-001234', customer: '김민수', date: '2024-12-30', status: '처리중', statusType: 'processing', amount: '$219' },
  { id: 'ORD-001233', customer: '이영희', date: '2024-12-29', status: '배송중', statusType: 'shipping', amount: '$156' },
  { id: 'ORD-001232', customer: '박철수', date: '2024-12-28', status: '완료', statusType: 'completed', amount: '$342' },
];

const quickActions = [
  { id: 1, label: '새 상품 등록', icon: '+', primary: true, path: '/admin/products/new' },
  { id: 2, label: '주문 관리', icon: '👁', path: '/admin/orders' },
  { id: 3, label: '매출 분석', icon: '📊' },
  { id: 4, label: '고객 관리', icon: '👥' },
];

function AdminPage() {
  const navigate = useNavigate();
  const [, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // admin만 접근 가능
          if (data.data.user_type !== 'admin') {
            alert('관리자만 접근할 수 있습니다.');
            navigate('/');
            return;
          }
          setUser(data.data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'cart':
        return <span className="stat-icon cart-icon">🛒</span>;
      case 'product':
        return <span className="stat-icon product-icon">📦</span>;
      case 'users':
        return <span className="stat-icon users-icon">👥</span>;
      case 'revenue':
        return <span className="stat-icon revenue-icon">📈</span>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-container">
      {/* 헤더 */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-logo">CIDER</h1>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="back-to-shop-btn" onClick={() => navigate('/')}>
          쇼핑몰로 돌아가기
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="admin-main">
        <div className="admin-title-section">
          <h2 className="admin-title">관리자 대시보드</h2>
          <p className="admin-subtitle">CIDER 쇼핑몰 관리 시스템에 오신 것을 환영합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="stats-grid">
          {statsData.map((stat) => (
            <div key={stat.id} className="stat-card">
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-change">
                  <span className="change-value">{stat.change}</span> {stat.changeText}
                </p>
              </div>
              {renderIcon(stat.icon)}
            </div>
          ))}
        </div>

        {/* 하단 섹션 */}
        <div className="admin-bottom-section">
          {/* 빠른 작업 */}
          <div className="quick-actions-card">
            <h3 className="card-title">빠른 작업</h3>
            <div className="quick-actions-list">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={`quick-action-btn ${action.primary ? 'primary' : ''}`}
                  onClick={() => action.path && navigate(action.path)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 최근 주문 */}
          <div className="recent-orders-card">
            <div className="card-header">
              <h3 className="card-title">최근 주문</h3>
              <button className="view-all-btn">전체보기</button>
            </div>
            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <p className="order-id">{order.id}</p>
                    <p className="order-customer">{order.customer}</p>
                    <p className="order-date">{order.date}</p>
                  </div>
                  <div className="order-right">
                    <span className={`order-status ${order.statusType}`}>
                      {order.status}
                    </span>
                    <p className="order-amount">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 관리 메뉴 카드 */}
        <div className="admin-menu-section">
          <div className="admin-menu-card" onClick={() => navigate('/admin/products')}>
            <div className="admin-menu-icon">
              <span>📦</span>
            </div>
            <h3 className="admin-menu-title">상품 관리</h3>
            <p className="admin-menu-desc">상품 등록, 수정, 삭제 및 재고 관리</p>
          </div>

          <div className="admin-menu-card" onClick={() => navigate('/admin/orders')}>
            <div className="admin-menu-icon">
              <span>🛒</span>
            </div>
            <h3 className="admin-menu-title">주문 관리</h3>
            <p className="admin-menu-desc">주문 조회, 상태 변경 및 배송 관리</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;

