import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAccessToken, getCurrentUser, logout } from '@sonhoseong/mfa-lib';
import { getPosts, PostSummary } from '@/network';
import { PREFIX } from '@/config/constants';

const BlogHeader: React.FC = () => {
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = !!accessToken;
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PostSummary[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // 스크롤 시 헤더 배경 변경
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const searchPosts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const res = await getPosts({ search: searchTerm, limit: 5 });
        if (res.success && res.data) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchPosts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
    navigate(`${PREFIX}/`);
  };

  const handleResultClick = () => {
    setSearchTerm('');
    setShowResults(false);
    setSearchFocused(false);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    setShowResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      setSearchFocused(false);
    }, 200);
  };

  const handleOverlayClick = () => {
    setSearchFocused(false);
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* 검색 오버레이 */}
      {searchFocused && <div className="search-overlay" onClick={handleOverlayClick} />}

      <header className={`blog-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="blog-header-inner">
          {/* Logo */}
          <Link to={`${PREFIX}/`} className="blog-header-logo">
            Blog
          </Link>

          {/* Search Bar */}
          <div className={`blog-header-search ${searchFocused ? 'focused' : ''}`}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>

            {/* Search Results Dropdown */}
            {showResults && searchTerm && (
              <div className="blog-search-results">
                {searching ? (
                  <div className="search-loading">검색 중...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((post) => (
                    <Link
                      key={post.id}
                      to={`${PREFIX}/post/${post.slug || post.id}`}
                      className="search-result-item"
                      onClick={handleResultClick}
                    >
                      <span className="search-result-title">{post.title}</span>
                      
                    </Link>
                  ))
                ) : (
                  <div className="search-empty">검색 결과가 없습니다</div>
                )}
              </div>
            )}
          </div>

          {/* Auth Area */}
          <div className="blog-header-auth">
            {isAuthenticated ? (
              <>
                <Link to={`${PREFIX}/my`} className="blog-header-user">
                  {currentUser?.name || 'User'}
                </Link>
                <button className="blog-header-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <Link to={`${PREFIX}/login`} className="blog-header-btn">
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export { BlogHeader };
