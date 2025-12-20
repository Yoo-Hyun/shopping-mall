import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminOrdersPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 주문 상태 정보
const ORDER_STATUSES = {
  pending: { label: '결제대기', color: '#ff9800', icon: '🕐' },
  paid: { label: '결제완료', color: '#5f0080', icon: '💳' },
  preparing: { label: '상품준비중', color: '#2196f3', icon: '📦' },
  shipping: { label: '배송중', color: '#4caf50', icon: '🚚' },
  delivered: { label: '배송완료', color: '#8bc34a', icon: '✅' },
  cancelled: { label: '주문취소', color: '#f44336', icon: '❌' },
  refund_requested: { label: '환불요청', color: '#ff5722', icon: '↩️' },
  refunded: { label: '환불완료', color: '#9e9e9e', icon: '💰' }
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

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    checkAdminAndFetchOrders();
  }, []);

  const checkAdminAndFetchOrders = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // 관리자 권한 확인
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();

      if (!userData.success || userData.data.user_type !== 'admin') {
        alert('관리자만 접근할 수 있습니다.');
        navigate('/');
        return;
      }

      // 전체 주문 가져오기
      const ordersResponse = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        setOrders(ordersData.data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태 변경
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('주문 상태가 변경되었습니다.');
      } else {
        alert(data.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 운송장 번호 등록
  const handleTrackingNumber = async (orderId) => {
    if (!trackingNumber.trim()) {
      alert('운송장 번호를 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, trackingNumber: trackingNumber.trim(), status: 'shipping' } 
            : order
        ));
        setTrackingNumber('');
        setIsModalOpen(false);
        setSelectedOrder(null);
        alert('운송장 번호가 등록되었습니다.');
      } else {
        alert(data.message || '운송장 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('운송장 등록 중 오류가 발생했습니다.');
    }
  };

  // 탭별 필터링
  const filteredOrders = orders.filter(order => {
    // 탭 필터
    if (selectedTab !== 'all') {
      if (selectedTab === 'ongoing' && !['pending', 'paid', 'preparing', 'shipping'].includes(order.status)) return false;
      if (selectedTab === 'completed' && order.status !== 'delivered') return false;
      if (selectedTab === 'cancelled' && !['cancelled', 'refund_requested', 'refunded'].includes(order.status)) return false;
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchOrderNumber = order.orderNumber?.toLowerCase().includes(term);
      const matchUserName = order.user?.name?.toLowerCase().includes(term);
      const matchUserEmail = order.user?.email?.toLowerCase().includes(term);
      return matchOrderNumber || matchUserName || matchUserEmail;
    }

    return true;
  });

  // 주문 상태별 카운트
  const orderCounts = {
    all: orders.length,
    ongoing: orders.filter(o => ['pending', 'paid', 'preparing', 'shipping'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => ['cancelled', 'refund_requested', 'refunded'].includes(o.status)).length
  };

  // 상태별 개별 카운트
  const statusCounts = {};
  Object.keys(ORDER_STATUSES).forEach(status => {
    statusCounts[status] = orders.filter(o => o.status === status).length;
  });

  if (loading) {
    return (
      <div className="admin-orders-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>주문 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      {/* 헤더 */}
      <header className="admin-orders-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            대시보드
          </button>
        </div>
        <div className="header-center">
          <h1 className="page-title">주문 관리</h1>
        </div>
        <div className="header-right">
          <span className="order-count">총 {orders.length}건</span>
        </div>
      </header>

      {/* 통계 카드 */}
      <div className="stats-section">
        <div className="stats-grid">
          {Object.entries(ORDER_STATUSES).slice(0, 5).map(([status, info]) => (
            <div 
              key={status} 
              className={`stat-card ${selectedTab === status ? 'active' : ''}`}
              onClick={() => setSelectedTab(status === selectedTab ? 'all' : status)}
            >
              <div className="stat-icon">{info.icon}</div>
              <div className="stat-info">
                <span className="stat-count" style={{ color: info.color }}>
                  {statusCounts[status]}
                </span>
                <span className="stat-label">{info.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="filter-section">
        <div className="tabs">
          <button 
            className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            전체 <span className="badge">{orderCounts.all}</span>
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setSelectedTab('ongoing')}
          >
            진행중 <span className="badge">{orderCounts.ongoing}</span>
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'completed' ? 'active' : ''}`}
            onClick={() => setSelectedTab('completed')}
          >
            배송완료 <span className="badge">{orderCounts.completed}</span>
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setSelectedTab('cancelled')}
          >
            취소/환불 <span className="badge">{orderCounts.cancelled}</span>
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="주문번호, 고객명, 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="orders-table-section">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>주문 내역이 없습니다</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>주문일시</th>
                <th>고객정보</th>
                <th>상품</th>
                <th>결제금액</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-number">{order.orderNumber}</td>
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  <td className="customer-info">
                    <span className="customer-name">{order.user?.name || '알 수 없음'}</span>
                    <span className="customer-email">{order.user?.email || ''}</span>
                  </td>
                  <td className="order-items">
                    <span className="item-name">
                      {order.items[0]?.name}
                      {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                    </span>
                    <span className="item-count">총 {order.items.reduce((sum, item) => sum + item.quantity, 0)}개</span>
                  </td>
                  <td className="order-amount">{order.totalAmount?.toLocaleString()}원</td>
                  <td className="order-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${ORDER_STATUSES[order.status]?.color}15`,
                        color: ORDER_STATUSES[order.status]?.color,
                        borderColor: ORDER_STATUSES[order.status]?.color
                      }}
                    >
                      {ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}
                    </span>
                  </td>
                  <td className="order-actions">
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {Object.entries(ORDER_STATUSES).map(([status, info]) => (
                        <option key={status} value={status}>{info.label}</option>
                      ))}
                    </select>
                    {['paid', 'preparing'].includes(order.status) && (
                      <button
                        className="tracking-btn"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                      >
                        🚚 운송장
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 운송장 등록 모달 */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>운송장 번호 등록</h3>
            <p className="modal-order-info">
              주문번호: <strong>{selectedOrder.orderNumber}</strong>
            </p>
            <div className="modal-input-group">
              <input
                type="text"
                placeholder="운송장 번호를 입력하세요"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                  setTrackingNumber('');
                }}
              >
                취소
              </button>
              <button 
                className="submit-btn"
                onClick={() => handleTrackingNumber(selectedOrder._id)}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
