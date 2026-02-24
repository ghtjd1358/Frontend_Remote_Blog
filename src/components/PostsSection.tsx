import React from 'react';
import {PostSummary} from "@/network";
import {PostCardSkeleton} from "@/components/PostCardSkeleton";
import {PostCard} from "@/components/PostCard";
import {DeferredComponent} from "@/components/DeferredComponent";


interface PostsSectionProps {
  posts: PostSummary[];
  isLoading: boolean;
}

const PostsSection: React.FC<PostsSectionProps> = ({ posts, isLoading }) => {
  return (
    <section id="posts" className="section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <div className="section-label">최근 포스트</div>
          <h2 className="section-title">블로그 글 목록</h2>
        </div>

        <div className="blog-grid">
          {isLoading ? (
            <DeferredComponent>
              <PostCardSkeleton count={30} />
            </DeferredComponent>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <p>아직 게시된 글이 없습니다.</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                animationDelay={index + 1}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export { PostsSection };
