import React from 'react';
import { PostSummary } from '@/network';
import { PostCard } from '@/components/PostCard';

interface PostsTabProps {
  posts: PostSummary[];
  isLoading?: boolean;
}

const PostsTab: React.FC<PostsTabProps> = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mypage-content">
        <div className="container">
          <div className="mypage-loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mypage-content">
        <div className="container">
          <div className="mypage-empty">
            <p>작성한 글이 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-content">
      <div className="container">
        <div className="mypage-posts-grid">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              animationDelay={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { PostsTab };