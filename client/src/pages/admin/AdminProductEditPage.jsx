import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminProductCreatePage.css';

// Cloudinary 설정 - 환경변수에서 가져옴
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    tags: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');

  // 사용 가능한 태그 목록
  const availableTags = ['인기', '파티', '추천', '신상품', '할인', '베스트'];

  // 관리자 권한 체크 및 상품 정보 가져오기
  useEffect(() => {
    const checkAuthAndFetchProduct = async () => {
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

        // 상품 정보 가져오기
        const productResponse = await fetch(`${API_URL}/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const productData = await productResponse.json();

        if (productData.success) {
          const product = productData.data;
          setFormData({
            sku: product.sku || '',
            name: product.name || '',
            category: product.category || '',
            price: product.price?.toString() || '',
            description: product.description || '',
            image: product.image || '',
            tags: product.tags || [],
          });
          if (product.image) {
            setImagePreview(product.image);
          }
        } else {
          alert('상품을 찾을 수 없습니다.');
          navigate('/admin/products');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      } finally {
        setFetchLoading(false);
      }
    };

    checkAuthAndFetchProduct();
  }, [navigate, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 태그 추가
  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 커스텀 태그 추가
  const handleAddCustomTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Cloudinary 위젯 열기
  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary 위젯을 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      alert('Cloudinary 환경변수가 설정되지 않았습니다.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        cropping: true,
        croppingAspectRatio: 1,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000,
        language: 'ko'
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          const imageUrl = result.info.secure_url;
          setImagePreview(imageUrl);
          setFormData(prev => ({
            ...prev,
            image: imageUrl
          }));
        }
      }
    );

    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name || !formData.category || !formData.price) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          description: formData.description,
          image: formData.image,
          tags: formData.tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('상품이 수정되었습니다.');
        navigate('/admin/products');
      } else {
        alert(data.message || '상품 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="product-create-container">
        <div className="loading-state" style={{ padding: '100px', textAlign: 'center' }}>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-create-container">
      {/* 헤더 */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-logo">CIDER</h1>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="back-to-shop-btn" onClick={() => navigate('/admin/products')}>
          상품 목록으로
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="product-create-main">
        <div className="page-title-section">
          <h2 className="page-title">상품 수정</h2>
          <p className="page-subtitle">상품 정보를 수정합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {/* 기본 정보 */}
          <section className="form-section">
            <h3 className="section-title">기본 정보</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  상품명 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="상품명을 입력하세요"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  SKU <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="상품 고유 코드"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  카테고리 <span className="required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">카테고리 선택</option>
                  <option value="일반">일반</option>
                  <option value="냉장">냉장</option>
                  <option value="냉동">냉동</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  가격 <span className="required">*</span>
                </label>
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input price-input"
                    min="0"
                  />
                  <span className="price-unit">원</span>
                </div>
              </div>
            </div>
          </section>

          {/* 상품 설명 */}
          <section className="form-section">
            <h3 className="section-title">상품 설명</h3>
            
            <div className="form-group">
              <label className="form-label">상품 설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="상품에 대한 상세 설명을 입력하세요"
                className="form-textarea"
                rows={6}
              />
            </div>
          </section>

          {/* 태그 */}
          <section className="form-section">
            <h3 className="section-title">태그</h3>
            <p className="section-hint">상품이 표시될 섹션을 선택하세요 (여러 개 선택 가능)</p>
            
            {/* 선택된 태그 */}
            {formData.tags.length > 0 && (
              <div className="selected-tags">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag selected">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 사용 가능한 태그 */}
            <div className="available-tags">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${formData.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => formData.tags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* 커스텀 태그 입력 */}
            <div className="custom-tag-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="새 태그 입력"
                className="form-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <button 
                type="button" 
                onClick={handleAddCustomTag}
                className="add-tag-btn"
              >
                추가
              </button>
            </div>
          </section>

          {/* 상품 이미지 */}
          <section className="form-section">
            <h3 className="section-title">상품 이미지</h3>
            
            <div className="image-upload-area">
              <div className="image-upload-box">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="상품 미리보기" />
                    <div className="image-overlay">
                      <button 
                        type="button" 
                        className="change-image-btn"
                        onClick={openCloudinaryWidget}
                      >
                        🔄 이미지 변경
                      </button>
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: '' }));
                        }}
                      >
                        ✕ 삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="upload-placeholder"
                    onClick={openCloudinaryWidget}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        openCloudinaryWidget();
                      }
                    }}
                  >
                    <span className="upload-icon">☁️</span>
                    <p className="upload-text">대표 이미지</p>
                    <p className="upload-hint">클릭하여 Cloudinary로 업로드</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 버튼 */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/admin/products')}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminProductEditPage;

