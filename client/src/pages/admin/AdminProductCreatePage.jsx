import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProductCreatePage.css';

// Cloudinary 설정 - 환경변수에서 가져옴
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminProductCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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

  // 관리자 권한 체크
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!data.success || data.data.user_type !== 'admin') {
          alert('관리자만 접근할 수 있습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

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

    // 환경변수 체크
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      alert('Cloudinary 환경변수가 설정되지 않았습니다.\n\nclient/.env 파일에 다음 값을 설정해주세요:\n- VITE_CLOUDINARY_CLOUD_NAME\n- VITE_CLOUDINARY_UPLOAD_PRESET');
      console.error('Missing Cloudinary environment variables:', {
        VITE_CLOUDINARY_CLOUD_NAME: CLOUDINARY_CLOUD_NAME ? '✓ 설정됨' : '✗ 미설정',
        VITE_CLOUDINARY_UPLOAD_PRESET: CLOUDINARY_UPLOAD_PRESET ? '✓ 설정됨' : '✗ 미설정'
      });
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
        croppingShowDimensions: true,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Noto Sans KR', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap',
              active: true
            }
          }
        },
        text: {
          ko: {
            or: '또는',
            back: '뒤로',
            advanced: '고급',
            close: '닫기',
            no_results: '결과 없음',
            search_placeholder: '검색...',
            about_uw: '업로드 위젯 정보',
            menu: {
              files: '내 파일',
              web: 'URL 주소',
              camera: '카메라'
            },
            local: {
              browse: '파일 선택',
              dd_title_single: '여기에 파일을 끌어다 놓으세요',
              dd_title_multi: '여기에 파일들을 끌어다 놓으세요',
              drop_title_single: '파일을 여기에 놓으세요',
              drop_title_multiple: '파일들을 여기에 놓으세요'
            },
            url: {
              inner_title: '업로드할 이미지 URL:',
              input_placeholder: '이미지 URL 입력'
            },
            camera: {
              capture: '촬영',
              cancel: '취소',
              take_pic: '사진 촬영하기',
              explanation: '카메라로 사진을 찍어 업로드합니다.'
            },
            crop: {
              title: '이미지 자르기',
              crop_btn: '자르기',
              skip_btn: '건너뛰기',
              reset_btn: '초기화'
            },
            queue: {
              title: '업로드 대기열',
              title_uploading_with_counter: '{{num}}개 파일 업로드 중',
              title_processing_with_counter: '{{num}}개 파일 처리 중',
              title_uploading: '파일 업로드 중',
              abort_all: '모두 취소',
              done: '완료'
            }
          }
        },
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
    
    // 유효성 검사
    if (!formData.sku || !formData.name || !formData.category || !formData.price) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
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
        alert('상품이 등록되었습니다.');
        navigate('/admin/products');
      } else {
        alert(data.message || '상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-create-container">
      {/* 헤더 */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-logo">CIDER</h1>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="back-to-shop-btn" onClick={() => navigate('/admin')}>
          대시보드로 돌아가기
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="product-create-main">
        <div className="page-title-section">
          <h2 className="page-title">상품 등록</h2>
          <p className="page-subtitle">새로운 상품을 등록합니다.</p>
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
                  placeholder="상품 고유 코드 (예: PROD-001)"
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
              onClick={() => navigate('/admin')}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminProductCreatePage;

