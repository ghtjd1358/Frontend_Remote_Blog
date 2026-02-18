import React, { useState } from 'react';
import { TagDetail } from '@/network';

interface TagSelectorProps {
  tags: TagDetail[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onTagToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="editor-tags">
      <div className="tags-header">
        <div className="tags-label">태그</div>
        <input
          type="text"
          className="tags-search"
          placeholder="태그 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {selectedTags.length > 0 && (
        <div className="tags-selected">
          {selectedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="tag-chip selected"
              onClick={() => onTagToggle(tag.id)}
            >
              #{tag.name} ×
            </button>
          ))}
        </div>
      )}

      <div className="tags-list">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className="tag-chip"
            onClick={() => onTagToggle(tag.id)}
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export { TagSelector };
