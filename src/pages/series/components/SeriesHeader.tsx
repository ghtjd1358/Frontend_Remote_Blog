import React from 'react';
import { Link } from 'react-router-dom';
import { SeriesDetailFull } from '@/network';
import { PREFIX } from '@/config/constants';

interface SeriesHeaderProps {
  series: SeriesDetailFull;
  postCount: number;
}

const SeriesHeader: React.FC<SeriesHeaderProps> = ({ series, postCount }) => {
  return (
    <header className="series-header">
      {series.cover_image && (
        <div className="series-cover">
          <img src={series.cover_image} alt={series.title} />
          <div className="series-cover-overlay" />
        </div>
      )}
      <div className="series-header-content">
        <div className="container">
          <span className="series-label">시리즈</span>
          <h1 className="series-title">{series.title}</h1>
          {series.description && (
            <p className="series-description">{series.description}</p>
          )}
          <div className="series-meta">
            {series.user && (
              <Link to={`${PREFIX}/my/${series.user.id}`} className="series-author">
                {series.user.avatar_url && (
                  <img
                    src={series.user.avatar_url}
                    alt={series.user.username}
                    className="series-author-avatar"
                  />
                )}
                <span>{series.user.username}</span>
              </Link>
            )}
            <span className="series-post-count">{postCount}개의 포스트</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export { SeriesHeader };
