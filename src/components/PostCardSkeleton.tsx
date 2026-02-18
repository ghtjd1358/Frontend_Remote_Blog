import React from 'react';

interface PostCardSkeletonProps {
  count?: number;
}

/**
 * PostCard 스켈레톤 UI
 */
const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="post-card post-card-skeleton">
          <div className="post-card-link">
            <div className="post-card-thumbnail">
              <div className="skeleton skeleton-image" />
            </div>
            <div className="post-card-body">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-date" />
            </div>
          </div>
          <div className="post-card-footer">
            <div className="skeleton skeleton-stat" />
          </div>
        </article>
      ))}
    </>
  );
};

export { PostCardSkeleton };
