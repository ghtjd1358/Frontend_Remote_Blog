import React from 'react';
import { LikeButton } from '@/components';
import { formatDate } from '@/utils';
import { PostDetail } from '@/network';

interface PostHeaderProps {
  post: PostDetail;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
  return (
    <header className="post-header">
      <div className="container">
        <div className="post-header-content">
          <div className="post-meta">
            <span className="post-date">{formatDate(post.published_at)}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-stats">
            <span className="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {post.view_count}
            </span>
            <LikeButton postId={post.id} initialLikeCount={post.like_count} />
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag.id} className="post-tag">#{tag.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { PostHeader };
