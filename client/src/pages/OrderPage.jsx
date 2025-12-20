import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './OrderPage.css';

const API_URL = 'http://localhost:5000/api';

function OrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 장바구니에서 전달받은 데이터
  const { items = [], totalItemsPrice = 0, shippingFee = 0 } = location.state || {};

  // 주문자 정보
  const [ordererInfo, setOrdererInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // 배송지 정보
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    phone: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    memo: ''
  });

  // 결제 수단
  const [paymentMethod, setPaymentMethod] = useState('card');

  // 약관 동의
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    payment: false
  });

  useEffect(() => {
    // 포트원 결제 모듈 초기화
    if (window.IMP) {
      window.IMP.init('imp40587761');
    }

    // 장바구니에서 넘어온 데이터가 없으면 장바구니로 리다이렉트
    if (!location.state || items.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate('/cart');
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        // 유저 정보로 주문자 정보 초기화
        setOrdererInfo({
          name: data.data.name || '',
          phone: '',
          email: data.data.email || ''
        });
        // 기본 배송지 정보 설정
        setShippingInfo(prev => ({
          ...prev,
          recipientName: data.data.name || '',
          address: data.data.address || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOrdererChange = (e) => {
    const { name, value } = e.target;
    setOrdererInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAgreementChange = (key) => {
    if (key === 'all') {
      const newValue = !agreements.all;
      setAgreements({
        all: newValue,
        terms: newValue,
        privacy: newValue,
        payment: newValue
      });
    } else {
      const newAgreements = {
        ...agreements,
        [key]: !agreements[key]
      };
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.payment;
      setAgreements(newAgreements);
    }
  };

  const handleCopyOrderer = () => {
    setShippingInfo(prev => ({
      ...prev,
      recipientName: ordererInfo.name,
      phone: ordererInfo.phone
    }));
  };

  const validateForm = () => {
    if (!ordererInfo.name || !ordererInfo.phone || !ordererInfo.email) {
      alert('주문자 정보를 모두 입력해주세요.');
      return false;
    }
    if (!shippingInfo.recipientName || !shippingInfo.phone || !shippingInfo.address) {
      alert('배송지 정보를 모두 입력해주세요.');
      return false;
    }
    if (!agreements.terms || !agreements.privacy || !agreements.payment) {
      alert('필수 약관에 동의해주세요.');
      return false;
    }
    return true;
  };

  // 결제 수단에 따른 PG사 설정
  const getPgProvider = (method) => {
    switch (method) {
      case 'kakao_pay':
        return 'kakaopay';
      case 'naver_pay':
        return 'naverpay';
      case 'bank_transfer':
        return 'html5_inicis';
      case 'card':
      default:
        return 'html5_inicis';
    }
  };

  // 결제 수단에 따른 pay_method 설정
  const getPayMethod = (method) => {
    switch (method) {
      case 'kakao_pay':
        return 'kakaopay';
      case 'naver_pay':
        return 'naverpay';
      case 'bank_transfer':
        return 'trans';
      case 'card':
      default:
        return 'card';
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    if (!window.IMP) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    // 주문번호 생성 (임시)
    const merchantUid = `order_${Date.now()}`;
    
    // 상품명 생성
    const productName = items.length > 1 
      ? `${items[0].product.name} 외 ${items.length - 1}건`
      : items[0].product.name;

    // 포트원 결제 요청
    window.IMP.request_pay(
      {
        pg: getPgProvider(paymentMethod),
        pay_method: getPayMethod(paymentMethod),
        merchant_uid: merchantUid,
        name: productName,
        amount: totalItemsPrice + shippingFee,
        buyer_email: ordererInfo.email,
        buyer_name: ordererInfo.name,
        buyer_tel: ordererInfo.phone,
        buyer_addr: `${shippingInfo.address} ${shippingInfo.addressDetail}`,
        buyer_postcode: shippingInfo.zipCode,
      },
      async (response) => {
        if (response.success) {
          // 결제 성공 시 서버에 주문 정보 저장
          try {
            const orderData = {
              items: items.map(item => ({
                product: item.product._id,
                quantity: item.quantity
              })),
              shippingAddress: {
                recipientName: shippingInfo.recipientName,
                phone: shippingInfo.phone,
                zipCode: shippingInfo.zipCode || '00000',
                address: shippingInfo.address,
                addressDetail: shippingInfo.addressDetail || '',
                memo: shippingInfo.memo || ''
              },
              payment: {
                method: paymentMethod,
                impUid: response.imp_uid || '',
                merchantUid: response.merchant_uid || '',
                paidAmount: response.paid_amount || (totalItemsPrice + shippingFee),
                status: 'paid'
              },
              shippingFee,
              discountAmount: 0
            };

            const orderResponse = await fetch(`${API_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(orderData)
            });

            const orderResult = await orderResponse.json();

            if (orderResult.success) {
              // 장바구니 비우기
              await fetch(`${API_URL}/cart`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              navigate('/order/complete', { 
                state: { 
                  orderNumber: orderResult.data.orderNumber,
                  totalAmount: orderResult.data.totalAmount
                }
              });
            } else {
              // 주문 저장 실패 시 실패 페이지로 이동
              navigate('/order/fail', {
                state: {
                  errorMessage: orderResult.message || '주문 저장에 실패했습니다.',
                  errorCode: 'ORDER_SAVE_FAILED'
                }
              });
            }
          } catch (error) {
            console.error('Error saving order:', error);
            // 서버 오류 시 실패 페이지로 이동
            navigate('/order/fail', {
              state: {
                errorMessage: '주문 저장 중 오류가 발생했습니다. 고객센터에 문의해주세요.',
                errorCode: 'SERVER_ERROR'
              }
            });
          }
        } else {
          // 결제 실패 시 실패 페이지로 이동
          navigate('/order/fail', {
            state: {
              errorMessage: response.error_msg || '결제가 취소되었거나 실패했습니다.',
              errorCode: response.error_code || 'PAYMENT_FAILED'
            }
          });
        }
        setSubmitting(false);
      }
    );
  };

  const totalAmount = totalItemsPrice + shippingFee;

  if (loading) {
    return (
      <div className="order-container">
        <Header user={user} onLogout={handleLogout} />
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>주문서를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="order-main">
        <h1 className="order-title">주문서</h1>

        <div className="order-content">
          {/* 왼쪽: 주문 정보 입력 */}
          <div className="order-form-section">
            {/* 주문자 정보 */}
            <section className="form-section">
              <h2 className="section-title">주문자 정보</h2>
              <div className="form-group">
                <label>보내는 분</label>
                <input
                  type="text"
                  name="name"
                  value={ordererInfo.name}
                  onChange={handleOrdererChange}
                  placeholder="이름을 입력해주세요"
                />
              </div>
              <div className="form-group">
                <label>휴대폰</label>
                <input
                  type="tel"
                  name="phone"
                  value={ordererInfo.phone}
                  onChange={handleOrdererChange}
                  placeholder="휴대폰 번호를 입력해주세요"
                />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  name="email"
                  value={ordererInfo.email}
                  onChange={handleOrdererChange}
                  placeholder="이메일을 입력해주세요"
                />
              </div>
            </section>

            {/* 배송지 정보 */}
            <section className="form-section">
              <div className="section-header">
                <h2 className="section-title">배송지</h2>
                <button type="button" className="copy-btn" onClick={handleCopyOrderer}>
                  주문자 정보와 동일
                </button>
              </div>
              <div className="form-group">
                <label>받는 분</label>
                <input
                  type="text"
                  name="recipientName"
                  value={shippingInfo.recipientName}
                  onChange={handleShippingChange}
                  placeholder="받는 분 이름을 입력해주세요"
                />
              </div>
              <div className="form-group">
                <label>휴대폰</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  placeholder="휴대폰 번호를 입력해주세요"
                />
              </div>
              <div className="form-group">
                <label>주소</label>
                <div className="address-inputs">
                  <div className="zipcode-row">
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      placeholder="우편번호"
                      className="zipcode-input"
                    />
                    <button type="button" className="search-address-btn">
                      주소 검색
                    </button>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    placeholder="기본주소"
                  />
                  <input
                    type="text"
                    name="addressDetail"
                    value={shippingInfo.addressDetail}
                    onChange={handleShippingChange}
                    placeholder="상세주소를 입력해주세요"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>배송 요청사항</label>
                <select
                  name="memo"
                  value={shippingInfo.memo}
                  onChange={handleShippingChange}
                >
                  <option value="">배송 요청사항을 선택해주세요</option>
                  <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                  <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                  <option value="벨 누르지 말아주세요">벨 누르지 말아주세요</option>
                  <option value="배송 전 연락 부탁드려요">배송 전 연락 부탁드려요</option>
                </select>
              </div>
            </section>

            {/* 주문 상품 */}
            <section className="form-section">
              <h2 className="section-title">주문 상품</h2>
              <div className="order-items">
                {items.map((item) => (
                  <div key={item.product._id} className="order-item">
                    <div className="item-image">
                      <img 
                        src={item.product.image || '/placeholder-image.png'} 
                        alt={item.product.name} 
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.product.name}</p>
                      <p className="item-option">수량: {item.quantity}개</p>
                      <p className="item-price">
                        {(item.product.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 결제 수단 */}
            <section className="form-section">
              <h2 className="section-title">결제 수단</h2>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">💳</span>
                  <span>신용카드</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">🏦</span>
                  <span>계좌이체</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'kakao_pay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="kakao_pay"
                    checked={paymentMethod === 'kakao_pay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">🟡</span>
                  <span>카카오페이</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'naver_pay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="naver_pay"
                    checked={paymentMethod === 'naver_pay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-icon">🟢</span>
                  <span>네이버페이</span>
                </label>
              </div>
            </section>
          </div>

          {/* 오른쪽: 결제 정보 */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h3 className="summary-title">결제금액</h3>
              
              <div className="summary-row">
                <span>상품금액</span>
                <span>{totalItemsPrice.toLocaleString()}원</span>
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
                <span>최종결제금액</span>
                <span className="total-amount">{totalAmount.toLocaleString()}원</span>
              </div>

              {/* 약관 동의 */}
              <div className="agreements">
                <label className="agreement-item all">
                  <input
                    type="checkbox"
                    checked={agreements.all}
                    onChange={() => handleAgreementChange('all')}
                  />
                  <span className="checkbox-custom"></span>
                  <span>전체 동의</span>
                </label>
                <div className="agreement-divider"></div>
                <label className="agreement-item">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange('terms')}
                  />
                  <span className="checkbox-custom"></span>
                  <span>구매조건 확인 및 결제진행에 동의 <em>(필수)</em></span>
                </label>
                <label className="agreement-item">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange('privacy')}
                  />
                  <span className="checkbox-custom"></span>
                  <span>개인정보 수집·이용 동의 <em>(필수)</em></span>
                </label>
                <label className="agreement-item">
                  <input
                    type="checkbox"
                    checked={agreements.payment}
                    onChange={() => handleAgreementChange('payment')}
                  />
                  <span className="checkbox-custom"></span>
                  <span>결제 서비스 이용 약관 동의 <em>(필수)</em></span>
                </label>
              </div>

              <button 
                className="submit-btn"
                onClick={handleSubmitOrder}
                disabled={submitting}
              >
                {submitting ? '주문 처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderPage;

