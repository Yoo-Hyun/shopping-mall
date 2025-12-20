import { useState, useEffect } from 'react';
import './HeroBanner.css';

const defaultBanners = [
  { id: 1, title: '이 밤의 완벽한 페어링', subtitle: '올해의 플래터', subtext: '치즈부터 샤퀴테리까지', date: '12.08 - 12.28', bgColor: '#4a3728', image: 'https://picsum.photos/800/400?random=100' },
  { id: 2, title: '겨울 간식 특가전', subtitle: '따뜻한 겨울', subtext: '호빵부터 붕어빵까지', date: '12.01 - 12.31', bgColor: '#2d4a5e', image: 'https://picsum.photos/800/400?random=101' },
  { id: 3, title: '크리스마스 특별 기획', subtitle: '홀리데이 시즌', subtext: '케이크와 와인 할인', date: '12.15 - 12.25', bgColor: '#5e2d4a', image: 'https://picsum.photos/800/400?random=102' },
];

function HeroBanner({ banners = defaultBanners, autoPlayInterval = 5000 }) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [banners.length, autoPlayInterval]);

  return (
    <section className="hero-banner" style={{ backgroundColor: banners[currentBanner].bgColor }}>
      <div className="banner-content">
        <div className="banner-text">
          <p className="banner-subtitle">{banners[currentBanner].subtitle}</p>
          <h2 className="banner-title">{banners[currentBanner].title}</h2>
          <p className="banner-subtext">{banners[currentBanner].subtext}</p>
          <p className="banner-date">{banners[currentBanner].date}</p>
          <button className="banner-btn">자세히보기 →</button>
        </div>
        <div className="banner-image">
          <img src={banners[currentBanner].image} alt="배너 이미지" />
        </div>
      </div>
      <div className="banner-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`indicator ${currentBanner === index ? 'active' : ''}`}
            onClick={() => setCurrentBanner(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;

