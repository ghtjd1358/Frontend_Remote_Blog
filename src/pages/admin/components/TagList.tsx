import React from 'react';
import { TagDetail } from '@/network';

interface TagListProps {
  tags: TagDetail[];
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
  return (
    <div className="manage-list">
      <h3>등록된 태그 ({tags.length})</h3>
      {tags.length === 0 ? (
        <div className="empty-state">
          <p>등록된 태그가 없습니다.</p>
        </div>
      ) : (
        <div className="manage-tags-grid">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="manage-tag-item"
              style={{ borderColor: tag.color || '#10b981' }}
            >
              <span
                className="manage-tag-dot"
                style={{ backgroundColor: tag.color || '#10b981' }}
              />
              <span className="manage-tag-name">#{tag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { TagList };
