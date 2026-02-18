import React from 'react';
import { TableOfContents } from '@/components';

interface PostContentProps {
  postId: string;
  content: string;
}

const PostContent: React.FC<PostContentProps> = ({ postId, content }) => {
  return (
    <div className="post-content-wrapper">
      <div className="post-detail-layout">
        <div className="post-detail-main">
          <div
            key={`content-${postId}`}
            className="post-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <TableOfContents key={`toc-${postId}`} content={content} />
      </div>
    </div>
  );
};

export { PostContent };
