import './PromoBanner.css';

function PromoBanner({ type = 'cake', title, icon, keyword, subtext }) {
  if (type === 'cake') {
    return (
      <section className="promo-banner cake-banner">
        <div className="promo-content">
          <h3 className="promo-title">{title || '빛나는 순간을 위한'}</h3>
          <div className="promo-search">
            <span className="promo-icon">{icon || '🎂'}</span>
            <span className="promo-keyword">{keyword || '케이크'}</span>
            <span className="promo-action">검색!</span>
          </div>
          <p className="promo-subtext">{subtext || '크리스마스 홈파티 • 주문 제작도 OK >'}</p>
        </div>
      </section>
    );
  }

  if (type === 'festa') {
    return (
      <section className="festa-banner">
        <div className="festa-content">
          <div className="festa-text">
            <span className="festa-badge">🍽️ 컬리푸드페스타 뺨</span>
            <h3 className="festa-title">버스 앙콜</h3>
            <p className="festa-subtext">관객과 미디어가 격찬한 컬리푸드페스타, 그 맛을 집에서 다시 느끼세요</p>
          </div>
          <div className="festa-product">
            <img src="https://picsum.photos/300/200?random=200" alt="페스타 상품" />
            <div className="festa-product-info">
              <p className="festa-product-date">KURLY'S HOLIDAY SERIES</p>
              <h4 className="festa-product-title">KURLY FOOD FESTA</h4>
              <p className="festa-product-period">2024.12.18-21</p>
              <button className="festa-more-btn">상세보기</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

export default PromoBanner;

