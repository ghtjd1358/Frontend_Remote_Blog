import React from 'react';
import { Link } from 'react-router-dom';
import { PostSummary } from '@/network';

interface PostCardProps {
  post: PostSummary;
  animationDelay?: number;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const PostCard: React.FC<PostCardProps> = ({ post, animationDelay = 1 }) => {
  const delay = Math.min(animationDelay, 5);
  const imageLoading = animationDelay <= 8 ? 'eager' : 'lazy';

  return (
    <article className={`post-card animate-on-scroll delay-${delay}`}>
      <Link
        to={`/blog/post/${post.slug || post.id}`}
        className="post-card-link"
      >
        <div className="post-card-thumbnail">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              loading={imageLoading}
              decoding="async"
              fetchPriority={animationDelay <= 4 ? 'high' : 'auto'}
            />
          ) : (
            <div className="post-card-thumbnail-placeholder">
              <span>{post.title.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="post-card-body">
          <h3 className="post-card-title">{post.title}</h3>
          <p className="post-card-excerpt">
            {post.excerpt || '내용 미리보기가 없습니다.'}
          </p>
          <span className="post-card-date">{formatDate(post.published_at)}</span>
        </div>
      </Link>

      <div className="post-card-footer">
        <div className="post-card-stats">
          <span className="post-card-stat">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 6h-2V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3H3a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1zM7 4h10v5H7V4zm13 14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8h1v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8h1v10z" />
            </svg>
            {post.comment_count || 0}
          </span>
          <span className="post-card-stat">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="m18 1-6 4-6-4-6 5v7l12 10 12-10V6z" />
            </svg>
            {post.like_count || 0}
          </span>
        </div>
      </div>
    </article>
  );
};

export { PostCard };
