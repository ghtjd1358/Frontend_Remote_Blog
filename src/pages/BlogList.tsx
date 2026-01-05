import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPosts,
  getCategories,
  getSeries,
  PostSummary,
  CategoryDetail,
  SeriesDetail
} from '../network';
import { ScrollTopButton } from '../components/button';

const navSections = [
  { id: 'posts', label: '포스트' },
  { id: 'series', label: '시리즈' },
  { id: 'categories', label: '카테고리' },
];

const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const BlogList: React.FC = () => {
  const [activeSection, setActiveSection] = useState('');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [series, setSeries] = useState<SeriesDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useScrollAnimation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes, seriesRes] = await Promise.all([
          getPosts(),
          getCategories(),
          getSeries()
        ]);

        console.log('Posts Response:', postsRes);
        console.log('Categories Response:', categoriesRes);
        console.log('Series Response:', seriesRes);

        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data.data);
        } else {
          console.error('Posts Error:', postsRes.error);
        }
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (seriesRes.success && seriesRes.data) {
          setSeries(seriesRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.2;

      for (const section of navSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 60;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      {/* 히어로 */}
      <section className="hero blog-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              개발 이야기를<br />
              기록합니다
            </h1>
            <p className="hero-desc">
              프론트엔드 개발 경험과 학습 내용을 공유하는 공간입니다.<br />
              함께 성장하는 개발자가 되고 싶습니다.
            </p>
            <div className="hero-buttons">
              <Link to="/write" className="btn btn-primary">
                글쓰기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 섹션 네비게이션 바 */}
      <div className="sticky-nav-wrapper">
        <nav className="sticky-nav">
          <button className="nav-logo-dots" onClick={scrollToTop}>
            <span className="dot blue"></span>
            <span className="dot green"></span>
            <span className="dot lime"></span>
          </button>
          <ul className="nav-pills">
            {navSections.map((section) => (
              <li key={section.id}>
                <button
                  className={`nav-pill ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 블로그 목록 */}
      <section id="posts" className="section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">최근 포스트</div>
            <h2 className="section-title">블로그 글 목록</h2>
          </div>

          {posts.length === 0 ? (
            <div className="empty-state">
              <p>아직 게시된 글이 없습니다.</p>
              <Link to="/write" className="btn btn-primary">첫 글 작성하기</Link>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post, index) => (
                <Link
                  to={`/post/${post.slug || post.id}`}
                  key={post.id}
                  className={`blog-card animate-on-scroll delay-${Math.min(index + 1, 5)}`}
                >
                  <div className="blog-card-meta">
                    <span className="blog-category">{post.category?.name || '미분류'}</span>
                    <span className="blog-date">{formatDate(post.published_at)}</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt || ''}</p>
                  <div className="blog-card-footer">
                    <span className="blog-read-time">👀 {post.view_count} · ❤️ {post.like_count}</span>
                    <span className="blog-read-more">읽기 →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 연재 시리즈 */}
      <section id="series" className="section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">Series</div>
            <h2 className="section-title">연재 시리즈</h2>
          </div>
          {series.length === 0 ? (
            <div className="empty-state">
              <p>아직 시리즈가 없습니다.</p>
            </div>
          ) : (
            <div className="series-grid">
              {series.map((s, index) => (
                <div key={s.id} className={`series-card animate-on-scroll delay-${index + 1}`}>
                  <div className="series-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="series-info">
                    <h3 className="series-title">{s.title}</h3>
                    <p className="series-desc">{s.description || ''}</p>
                    <div className="series-meta">
                      <span className="series-count">{s.post_count || 0}편</span>
                      <span className={`series-status ${s.status === 'completed' ? 'complete' : 'ongoing'}`}>
                        {s.status === 'completed' ? '완결' : '연재중'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 카테고리 */}
      <section id="categories" className="section categories">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">카테고리</div>
            <h2 className="section-title">관심 주제별 탐색</h2>
          </div>
          {categories.length === 0 ? (
            <div className="empty-state">
              <p>아직 카테고리가 없습니다.</p>
            </div>
          ) : (
            <div className="category-grid">
              {categories.map((cat, index) => (
                <div key={cat.id} className={`category-card animate-on-scroll delay-${index + 1}`}>
                  <div className="category-icon">{cat.icon || '📁'}</div>
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-count" style={{ color: cat.color || '#666' }}>
                    {posts.filter(p => p.category?.id === cat.id).length}개의 글
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ScrollTopButton />
    </>
  );
};

export default BlogList;
