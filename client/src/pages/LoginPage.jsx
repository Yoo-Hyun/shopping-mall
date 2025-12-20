import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LoginPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 토큰 저장
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        alert('로그인 성공!');
        navigate('/');
      } else {
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">로그인</h1>

        <div className="security-notice">
          <p>안전한 이용 및 회원님의 정보 보호를 위해</p>
          <p><strong>현재 보안서비스가 실행 중입니다.</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="아이디를 입력해주세요"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력해주세요"
              className="form-input"
            />
          </div>

          <div className="find-links">
            <a href="#" className="find-link">아이디 찾기</a>
            <span className="divider">|</span>
            <a href="#" className="find-link">비밀번호 찾기</a>
          </div>

          <button type="submit" className="login-btn">
            로그인
          </button>

          <button 
            type="button" 
            className="signup-btn"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </form>

        <div className="social-login-section">
          <h3 className="social-title">간편 로그인</h3>
          
          <div className="social-buttons">
            <button className="social-btn facebook">
              <span className="social-icon facebook-icon">f</span>
              <span>Facebook로 로그인</span>
            </button>
            
            <button className="social-btn google">
              <span className="social-icon google-icon">G</span>
              <span>google로 로그인</span>
            </button>
            
            <button className="social-btn line">
              <span className="social-icon line-icon">LINE</span>
              <span>LINE로 로그인</span>
            </button>
            
            <button className="social-btn apple">
              <span className="social-icon apple-icon"></span>
              <span>Apple로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

