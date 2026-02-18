import React, { useEffect, useState, useCallback, useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Parse headings from HTML content
  const tocItems = useMemo((): TocItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4');

    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const text = heading.textContent?.trim() || '';
      if (text) {
        const id = heading.id || `heading-${index}`;
        items.push({
          id,
          text,
          level: parseInt(heading.tagName.charAt(1))
        });
      }
    });

    return items;
  }, [content]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    return minutes;
  }, [content]);

  // Add IDs to headings in the actual DOM
  useEffect(() => {
    // DOM 업데이트 후 실행되도록 requestAnimationFrame 사용
    const assignIds = () => {
      const contentElement = document.querySelector('.post-content');
      if (!contentElement) return;

      const headings = contentElement.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((heading, index) => {
        // 항상 heading-{index} 형태로 ID 부여 (일관성 유지)
        heading.id = `heading-${index}`;
      });
    };

    // 약간의 지연 후 실행 (dangerouslySetInnerHTML 렌더링 대기)
    requestAnimationFrame(() => {
      requestAnimationFrame(assignIds);
    });
  }, [content]);

  // Scrollspy logic
  useEffect(() => {
    const handleScroll = () => {
      const contentElement = document.querySelector('.post-content');
      if (!contentElement) return;

      const headings = contentElement.querySelectorAll('h1, h2, h3, h4');
      const scrollPosition = window.scrollY + 120;

      // Calculate progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / docHeight) * 100;
      setProgress(Math.min(scrolled, 100));

      // Find active heading
      let currentId = '';
      headings.forEach((heading) => {
        const element = heading as HTMLElement;
        if (element.offsetTop <= scrollPosition) {
          currentId = element.id;
        }
      });

      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const scrollToHeading = useCallback((id: string) => {
    // 먼저 ID로 찾고, 없으면 post-content 내에서 다시 찾기
    let element = document.getElementById(id);

    if (!element) {
      // ID가 없을 경우 post-content 내의 headings에서 직접 찾기
      const contentElement = document.querySelector('.post-content');
      if (contentElement) {
        const headings = contentElement.querySelectorAll('h1, h2, h3, h4');
        const index = parseInt(id.replace('heading-', ''));
        if (!isNaN(index) && headings[index]) {
          element = headings[index] as HTMLElement;
          // ID 부여
          element.id = id;
        }
      }
    }

    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setIsMobileOpen(false);
    }
  }, []);

  if (tocItems.length === 0) {
    return null;
  }

  const TocList = () => (
    <ul className="toc-list">
      {tocItems.map((item) => (
        <li
          key={item.id}
          className="toc-item"
          data-depth={item.level}
        >
          <span
            className={`toc-link ${activeId === item.id ? 'active' : ''}`}
            onClick={() => scrollToHeading(item.id)}
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop TOC */}
      <aside className={`post-toc-wrapper ${className || ''}`}>
        <nav className="post-toc">
          <div className="post-toc-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            목차
          </div>

          <div className="toc-progress">
            <div
              className="toc-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="toc-reading-time">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            약 {readingTime}분
          </div>

          <TocList />
        </nav>
      </aside>

      {/* Mobile TOC Toggle Button */}
      <button
        className="toc-mobile-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="목차 열기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>

      {/* Mobile TOC Overlay */}
      <div
        className={`toc-overlay ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile TOC Panel */}
      <div className={`toc-mobile-panel ${isMobileOpen ? 'open' : ''}`}>
        <div className="toc-mobile-header">
          <h3>목차</h3>
          <button
            className="toc-mobile-close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="닫기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="toc-mobile-content">
          <div className="toc-reading-time">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            약 {readingTime}분 소요
          </div>
          <TocList />
        </div>
      </div>
    </>
  );
};

export { TableOfContents };
