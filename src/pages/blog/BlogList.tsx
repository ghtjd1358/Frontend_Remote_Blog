import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPosts,
  getCategories,
  getSeries,
  PostSummary,
  CategoryDetail,
  SeriesDetail
} from '../../network';
import { ScrollTopButton, StickyNav } from '@sonhoseong/mfa-lib';

const navSections = [
  { id: 'posts', label: '포스트' },
  { id: 'series', label: '시리즈' },
  { id: 'categories', label: '카테고리' },
];

const useScrollAnimation = (deps: unknown[] = []) => {
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
  }, deps);
};

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [series, setSeries] = useState<SeriesDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useScrollAnimation([loading, posts.length, categories.length, series.length]);

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
      <StickyNav
        sections={navSections}
        scrollOffset={60}
        topPosition={20}
      />

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
                  {/* Thumbnail */}
                  <div className="blog-card-thumbnail">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} loading="lazy" />
                    ) : (
                      <div className="blog-card-thumbnail-placeholder">
                        <span>{post.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span className="blog-category">{post.category?.name || '미분류'}</span>
                      <span className="blog-date">{formatDate(post.published_at)}</span>
                    </div>

                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt || '내용 미리보기가 없습니다.'}</p>

                    <div className="blog-card-footer">
                      <div className="blog-card-stats">
                        <span className="blog-card-stat">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {post.view_count || 0}
                        </span>
                        <span className="blog-card-stat">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          {post.like_count || 0}
                        </span>
                      </div>
                      <span className="blog-read-more">
                        더 보기
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </div>
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
            <>
              <div className="category-grid">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className={`category-card animate-on-scroll delay-${index + 1} ${selectedCategory === cat.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    <div className="category-icon">{cat.icon || '📁'}</div>
                    <h3 className="category-name">{cat.name}</h3>
                    <span className="category-count" style={{ color: cat.color || '#666' }}>
                      {posts.filter(p => p.category?.id === cat.id).length}개의 글
                    </span>
                  </div>
                ))}
              </div>

              {/* 선택된 카테고리의 글 목록 */}
              {selectedCategory && (
                <div className="category-posts-panel">
                  <div className="category-posts-header">
                    <h3>
                      {categories.find(c => c.id === selectedCategory)?.icon}{' '}
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </h3>
                    <button className="close-btn" onClick={() => setSelectedCategory(null)}>✕</button>
                  </div>
                  <div className="category-posts-grid">
                    {posts
                      .filter(p => p.category?.id === selectedCategory)
                      .slice(0, 5)
                      .map((post) => (
                        <Link
                          to={`/post/${post.slug || post.id}`}
                          key={post.id}
                          className="category-post-card"
                        >
                          <div className="category-post-thumb">
                            {post.cover_image ? (
                              <img src={post.cover_image} alt={post.title} />
                            ) : (
                              <div className="category-post-placeholder">
                                <span>{post.title.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="category-post-info">
                            <h4 className="category-post-title">{post.title}</h4>
                            <span className="category-post-date">{formatDate(post.published_at)}</span>
                          </div>
                        </Link>
                      ))}
                  </div>
                  {posts.filter(p => p.category?.id === selectedCategory).length > 5 && (
                    <div className="category-posts-more">
                      <button className="btn btn-secondary btn-sm">
                        더보기 ({posts.filter(p => p.category?.id === selectedCategory).length - 5}개 더)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <ScrollTopButton />
    </>
  );
};

export default BlogList;
