import React from 'react';
import { PostSummary } from '@/network';
import { PostCard } from './PostCard';

interface ParallaxCardSectionProps {
  posts: PostSummary[];
  backgroundImage?: string;
  maxCards?: number;
  isLoading?: boolean;
}

const ParallaxCardSection: React.FC<ParallaxCardSectionProps> = ({
  posts,
  backgroundImage = '/cloude.png',
  maxCards = 4,
  isLoading = false
}) => {
  const displayPosts = posts.slice(0, maxCards);

  // 로딩 중이거나 포스트가 없으면 렌더링 안 함
  if (isLoading || displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="parallax-card-section">
      {/* 패럴랙스 배경 */}
      <div className="parallax-bg-wrapper">
        <div
          className="parallax-bg"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="parallax-overlay" />

        {/* 상단 웨이브 */}
        <svg
          className="parallax-wave-top"
          preserveAspectRatio="none"
          viewBox="0 0 1440 96"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,96 L48,80 C96,64 192,32 288,21.3 C384,11 480,21 576,37.3 C672,53 768,75 864,74.7 C960,75 1056,53 1152,42.7 C1248,32 1344,32 1392,32 L1440,32 L1440,0 L0,0 Z"
            fill="var(--bg-primary)"
          />
        </svg>

        {/* 하단 웨이브 */}
        <svg
          className="parallax-wave-bottom"
          preserveAspectRatio="none"
          viewBox="0 0 1440 96"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 L48,16 C96,32 192,64 288,74.7 C384,85 480,75 576,58.7 C672,43 768,21 864,21.3 C960,21 1056,43 1152,53.3 C1248,64 1344,64 1392,64 L1440,64 L1440,96 L0,96 Z"
            fill="var(--bg-primary)"
          />
        </svg>
      </div>

      {/* 카드 컨테이너 */}
      <div className="parallax-card-container">
        <div className="parallax-card-grid">
          {displayPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              animationDelay={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { ParallaxCardSection };
