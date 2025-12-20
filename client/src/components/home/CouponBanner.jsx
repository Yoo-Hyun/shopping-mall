import './CouponBanner.css';

function CouponBanner({ text, subtext }) {
  return (
    <section className="coupon-banner">
      <div className="coupon-inner">
        <span className="coupon-text">{text || '🎫 매일 11시 선착순 1만원 쿠폰 도전'}</span>
        <span className="coupon-subtext">{subtext || '알림 신청하고 쿠폰 도전하기 >'}</span>
      </div>
    </section>
  );
}

export default CouponBanner;

