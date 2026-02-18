import React from 'react';

interface BlogStatsProps {
  totalViews: number;
  totalPosts: number;
  totalLikes: number;
  daysRunning: number;
}

const BlogStats: React.FC<BlogStatsProps> = ({
  totalViews,
  totalPosts,
  totalLikes,
  daysRunning
}) => {
  return (
    <section className="blog-stats-section">
      <div className="container">
        <div className="blog-stats">
          <div className="blog-stat">
            <span className="blog-stat-value">{totalViews.toLocaleString()}</span>
            <span className="blog-stat-label">총 방문</span>
          </div>
          <div className="blog-stat">
            <span className="blog-stat-value">{totalPosts}</span>
            <span className="blog-stat-label">포스트</span>
          </div>
          <div className="blog-stat">
            <span className="blog-stat-value">{totalLikes}</span>
            <span className="blog-stat-label">좋아요</span>
          </div>
          <div className="blog-stat">
            <span className="blog-stat-value">{daysRunning}</span>
            <span className="blog-stat-label">일째 운영</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export { BlogStats };
