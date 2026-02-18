import React from 'react';
import { UserStats as UserStatsType } from '@/network';

interface UserStatsProps {
  stats: UserStatsType | null;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const items = [
    { label: '게시글', value: stats?.total_posts || 0 },
    { label: '조회수', value: stats?.total_views || 0 },
    { label: '좋아요', value: stats?.total_likes || 0 },
  ];

  return (
    <div className="mypage-stats-section">
      <div className="container">
        <div className="mypage-stats">
          {items.map((item) => (
            <div key={item.label} className="mypage-stat">
              <div className="mypage-stat-value">
                {item.value.toLocaleString()}
              </div>
              <div className="mypage-stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { UserStats };