import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-section">
            <h4 className="footer-title">고객행복센터</h4>
            <p className="footer-phone">1644-1107</p>
            <p className="footer-time">월~토요일 오전 7시 - 오후 6시</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">회사소개</h4>
            <div className="footer-links">
              <a href="#">회사소개</a>
              <a href="#">인재채용</a>
              <a href="#">이용약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">SNS</h4>
            <div className="social-links">
              <a href="#" className="social-icon">📷</a>
              <a href="#" className="social-icon">📘</a>
              <a href="#" className="social-icon">📺</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© KURLY CORP. ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

