import './OriginalSection.css';

const defaultItems = [
  { id: 1, title: '발효 치즈 찾는 분 취향', subtitle: '꼭 챙 볼러 숙성된 체다인 치즈', image: 'https://picsum.photos/280/320?random=300' },
  { id: 2, title: '삼겹없음 행사찌개 스페셜', subtitle: '시간이 짧은 내 발상처럼 못만들었어', image: 'https://picsum.photos/280/320?random=301' },
];

function OriginalSection({ title = '마켓컬리 ORIGINAL', subtitle = '컬 ONLY의 브랜드 부담을 찾기', items = defaultItems }) {
  return (
    <section className="section original-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <div className="original-grid">
        {items.map((item) => (
          <div key={item.id} className="original-card">
            <img src={item.image} alt={item.title} />
            <div className="original-info">
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default OriginalSection;

