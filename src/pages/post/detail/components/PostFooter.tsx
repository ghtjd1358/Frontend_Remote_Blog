import React from 'react';
import { Button } from '@/components';
import { PREFIX } from '@/config/constants';

interface PostFooterProps {
  postSlug: string;
  postId: string;
  onDelete: () => void;
}

const PostFooter: React.FC<PostFooterProps> = ({ postSlug, postId, onDelete }) => {
  return (
    <footer className="post-footer">
      <div className="container">
        <div className="post-actions">
          <Button as="link" to={`${PREFIX}/`} variant="secondary">
            ← 목록으로
          </Button>
          <div className="post-action-buttons">
            <Button as="link" to={`${PREFIX}/edit/${postSlug || postId}`} variant="secondary">
              수정
            </Button>
            <Button variant="danger" onClick={onDelete}>
              삭제
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { PostFooter };
