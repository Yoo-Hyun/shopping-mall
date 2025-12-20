import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProductsPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminProductsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 4;

  // 카테고리 목록
  const categories = ['all', 'Outerwear', 'Dresses', 'Bottoms', 'Tops', 'Accessories'];

  // 상품 목록 가져오기 함수
  const fetchProducts = async (page = 1) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      // 상품 목록 가져오기 (페이지네이션 적용)
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const productsResponse = await fetch(
        `${API_URL}/products?page=${page}&limit=${itemsPerPage}${categoryParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const productsData = await productsResponse.json();

      if (productsData.success) {
        setProducts(productsData.data);
        setTotalPages(productsData.totalPages);
        setTotalCount(productsData.totalCount);
        setCurrentPage(productsData.currentPage);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 관리자 권한 체크 및 상품 목록 가져오기
  useEffect(() => {
    const checkAuthAndFetchProducts = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 권한 체크
        const authResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const authData = await authResponse.json();

        if (!authData.success || authData.data.user_type !== 'admin') {
          alert('관리자만 접근할 수 있습니다.');
          navigate('/');
          return;
        }

        // 상품 목록 가져오기
        await fetchProducts(1);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    checkAuthAndFetchProducts();
  }, [navigate]);

  // 카테고리 변경시 상품 다시 불러오기
  useEffect(() => {
    if (!loading) {
      fetchProducts(1);
    }
  }, [selectedCategory]);

  // 상품 삭제
  const handleDelete = async (productId) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProducts(products.filter(p => p._id !== productId));
        alert('상품이 삭제되었습니다.');
      } else {
        alert(data.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 가격 포맷
  const formatPrice = (price, originalPrice) => {
    const formattedPrice = price?.toLocaleString() || '0';
    const formattedOriginalPrice = originalPrice?.toLocaleString() || '0';
    
    if (originalPrice && originalPrice > price) {
      return (
        <div className="price-cell">
          <span className="current-price">{formattedPrice}원</span>
          <span className="admin-original-price">{formattedOriginalPrice}원</span>
        </div>
      );
    }
    return <span className="current-price">{formattedPrice}원</span>;
  };

  return (
    <div className="admin-products-container">
      {/* 헤더 */}
      <header className="products-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            <span className="back-icon">←</span>
          </button>
          <h1 className="page-title">상품 관리</h1>
        </div>
        <button 
          className="add-product-btn"
          onClick={() => navigate('/admin/products/new')}
        >
          <span>+</span> 새 상품 등록
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="products-main">
        {/* 탭 메뉴 */}
        <div className="tab-menu">
          <button 
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            상품 목록
          </button>
          <button 
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('add');
              navigate('/admin/products/new');
            }}
          >
            상품 등록
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="search-filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="상품명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-wrapper">
            <button 
              className="filter-btn"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <span className="filter-icon">▽</span>
              필터
            </button>
            {showFilterDropdown && (
              <div className="filter-dropdown">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {category === 'all' ? '전체' : category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 상품 테이블 */}
        <div className="products-table-wrapper">
          {loading ? (
            <div className="loading-state">
              <p>상품 목록을 불러오는 중...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>등록된 상품이 없습니다.</p>
              <button 
                className="add-first-product-btn"
                onClick={() => navigate('/admin/products/new')}
              >
                첫 상품 등록하기
              </button>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th className="th-image">이미지</th>
                  <th className="th-name">상품명</th>
                  <th className="th-category">카테고리</th>
                  <th className="th-tags">태그</th>
                  <th className="th-price">가격</th>
                  <th className="th-actions">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td className="td-image">
                      <div className="admin-product-image-wrapper">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="admin-product-image"
                          />
                        ) : (
                          <div className="no-image">
                            <span>📷</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="td-name">
                      <div className="admin-product-name-cell">
                        <span className="admin-product-name">{product.name}</span>
                        <span className="admin-product-sku">{product.sku}</span>
                      </div>
                    </td>
                    <td className="td-category">{product.category}</td>
                    <td className="td-tags">
                      <div className="tags-cell">
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag, index) => (
                            <span key={index} className="product-tag">{tag}</span>
                          ))
                        ) : (
                          <span className="no-tags">-</span>
                        )}
                      </div>
                    </td>
                    <td className="td-price">
                      {formatPrice(product.price, product.originalPrice)}
                    </td>
                    <td className="td-actions">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(product._id)}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← 이전
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                  onClick={() => fetchProducts(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음 →
            </button>
          </div>
        )}

        {/* 총 상품 수 표시 */}
        {totalCount > 0 && (
          <p className="total-count">
            총 {totalCount}개의 상품 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}개 표시
          </p>
        )}
      </main>
    </div>
  );
}

export default AdminProductsPage;
