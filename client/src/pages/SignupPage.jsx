import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function SignupPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllAgreement = (e) => {
    const checked = e.target.checked;
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    const newAgreements = {
      ...agreements,
      [name]: checked,
    };
    
    // 전체 동의 체크 상태 업데이트
    newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
    setAgreements(newAgreements);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 서버로 보낼 데이터 구성
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      user_type: 'customer',
      address: '',
    };

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        alert('회원가입이 완료되었습니다!');
        navigate('/');
      } else {
        alert(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">회원가입</h1>
        <p className="signup-subtitle">새로운 계정을 만들어 쇼핑을 시작하세요</p>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* 이름 필드 */}
          <div className="form-group">
            <label className="form-label">이름</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="이름을 입력하세요"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* 이메일 필드 */}
          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* 비밀번호 필드 */}
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                className="form-input"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="input-hint">8자 이상, 영문, 숫자, 특수문자 포함</p>
          </div>

          {/* 비밀번호 확인 필드 */}
          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="비밀번호를 다시 입력하세요"
                className="form-input"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="agreements-section">
            <label className="agreement-item agreement-all">
              <input
                type="checkbox"
                name="all"
                checked={agreements.all}
                onChange={handleAllAgreement}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">전체 동의</span>
            </label>

            <div className="agreement-divider"></div>

            <label className="agreement-item">
              <input
                type="checkbox"
                name="terms"
                checked={agreements.terms}
                onChange={handleAgreementChange}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">이용약관 동의 (필수)</span>
              <button type="button" className="view-btn">보기</button>
            </label>

            <label className="agreement-item">
              <input
                type="checkbox"
                name="privacy"
                checked={agreements.privacy}
                onChange={handleAgreementChange}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">개인정보처리방침 동의 (필수)</span>
              <button type="button" className="view-btn">보기</button>
            </label>

            <label className="agreement-item">
              <input
                type="checkbox"
                name="marketing"
                checked={agreements.marketing}
                onChange={handleAgreementChange}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>

          {/* 회원가입 버튼 */}
          <button type="submit" className="submit-btn">
            회원가입
          </button>
        </form>

        <p className="login-link">
          이미 계정이 있으신가요? <a href="/">로그인</a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;

