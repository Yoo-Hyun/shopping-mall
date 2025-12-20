import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroBanner from '../components/home/HeroBanner';
import CouponBanner from '../components/home/CouponBanner';
import ProductSection from '../components/home/ProductSection';
import PromoBanner from '../components/home/PromoBanner';
import OriginalSection from '../components/home/OriginalSection';
import './HomePage.css';

const API_URL = 'http://localhost:5000/api';

function HomePage() {
  const [user, setUser] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [partyMenuProducts, setPartyMenuProducts] = useState([]);
  const [aiRecommendProducts, setAiRecommendProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 유저 정보 가져오기
        const token = localStorage.getItem('token');
        if (token) {
          const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userResponse.json();
          if (userData.success) {
            setUser(userData.data);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }

        // 각 섹션별 상품 데이터 가져오기 (병렬 처리)
        const [popularRes, partyRes, recommendRes] = await Promise.all([
          fetch(`${API_URL}/products/tag/인기?limit=5`),
          fetch(`${API_URL}/products/tag/파티?limit=4`),
          fetch(`${API_URL}/products/tag/추천?limit=4`),
        ]);

        const [popularData, partyData, recommendData] = await Promise.all([
          popularRes.json(),
          partyRes.json(),
          recommendRes.json(),
        ]);

        if (popularData.success) {
          // 인기 랭킹용 데이터 변환
          const productsWithRank = popularData.data.map((product, index) => ({
            ...product,
            id: product._id,
            rank: index + 1,
            originalPrice: product.price,
            discountPrice: product.price,
            discount: 0,
          }));
          setPopularProducts(productsWithRank);
        }

        if (partyData.success) {
          const partyProducts = partyData.data.map(product => ({
            ...product,
            id: product._id,
            originalPrice: product.price,
            discountPrice: product.price,
            discount: 0,
          }));
          setPartyMenuProducts(partyProducts);
        }

        if (recommendData.success) {
          const recommendProducts = recommendData.data.map(product => ({
            ...product,
            id: product._id,
            originalPrice: product.price,
            discountPrice: product.price,
            discount: 0,
          }));
          setAiRecommendProducts(recommendProducts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="home-container">
      <Header user={user} onLogout={handleLogout} />

      <HeroBanner />

      <CouponBanner />

      <main className="main-content">
        <ProductSection
          title="🏆 실시간 인기 랭킹"
          subtitle="지금 가장 많이 담는 특가 상품을 만나보세요"
          products={popularProducts}
          showRank={true}
          columns={5}
          showViewAll={true}
        />

        <ProductSection
          title="🍕 분위기 내는 연말 홈파티 메뉴"
          link="#"
          products={partyMenuProducts}
          columns={4}
        />

        <PromoBanner type="cake" />

        <PromoBanner type="festa" />

        <ProductSection
          title="🤖 AI 추천 12월 필수 아이템"
          subtitle="다른 고객 맞춤 AI 추천"
          products={aiRecommendProducts}
          columns={4}
        />

        <OriginalSection />
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
