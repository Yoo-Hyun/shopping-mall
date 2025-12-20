import ProductCard from './ProductCard';
import './ProductSection.css';

function ProductSection({ 
  title, 
  subtitle, 
  link, 
  products, 
  showRank = false, 
  columns = 4,
  showViewAll = false 
}) {
  const gridClass = columns === 5 ? 'product-grid rank-grid' : 'product-grid';

  return (
    <section className="section">
      <div className="section-header">
        <div className="section-header-left">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {link && (
          <a href={link} className="section-link">전체보기 &gt;</a>
        )}
      </div>
      <div className={gridClass}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            showRank={showRank}
          />
        ))}
      </div>
      {showViewAll && (
        <button className="view-all-btn">전체보기 &gt;</button>
      )}
    </section>
  );
}

export default ProductSection;

