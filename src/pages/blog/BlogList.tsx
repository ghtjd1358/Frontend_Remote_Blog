import React from 'react';
import {useBlogData, useScrollAnimation} from "@/hooks";
import {BlogStats, HeroSection, PostsSection} from "@/components";

const BlogList: React.FC = () => {
  const { posts, stats: {totalPosts, totalViews, totalLikes, daysRunning}, isLoading } = useBlogData(20);

  useScrollAnimation([posts.length]);

  return (
    <>
      <HeroSection />
        <BlogStats
            totalViews={totalViews}
            totalPosts={totalPosts}
            totalLikes={totalLikes}
            daysRunning={daysRunning}
        />
      <PostsSection posts={posts} isLoading={isLoading} />
    </>
  );
};

export default BlogList;
