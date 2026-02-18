import React, { useState } from 'react';
import { useToast } from '@sonhoseong/mfa-lib';
import { createTag, TagDetail } from '@/network';

interface CreateTagRequest {
  name: string;
  slug?: string;
  color?: string | null;
}

interface TagFormProps {
  onTagCreated: (tag: TagDetail) => void;
}

const TagForm: React.FC<TagFormProps> = ({ onTagCreated }) => {
  const toast = useToast();
  const [tagForm, setTagForm] = useState<CreateTagRequest>({
    name: '',
    slug: '',
    color: '#10b981',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagForm.name.trim()) {
      toast.warning('태그 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    createTag({
      ...tagForm,
      slug: tagForm.slug || tagForm.name.toLowerCase().replace(/s+/g, '-'),
    })
      .then((result) => {
        if (result.success && result.data) {
          onTagCreated(result.data);
          setTagForm({
            name: '',
            slug: '',
            color: '#10b981',
          });
          toast.success('태그가 생성되었습니다.');
        } else {
          toast.error(result.error || '태그 생성에 실패했습니다.');
        }
      })
      .catch(() => toast.error('태그 생성 중 오류가 발생했습니다.'))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="manage-form-card">
      <h3>새 태그 추가</h3>
      <form onSubmit={handleSubmit} className="manage-form">
        <div className="form-row">
          <div className="form-group">
            <label>이름 *</label>
            <input
              type="text"
              value={tagForm.name}
              onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
              placeholder="예: React"
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label>슬러그</label>
            <input
              type="text"
              value={tagForm.slug}
              onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
              placeholder="예: react"
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label>색상</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={tagForm.color || '#10b981'}
                onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
              />
              <span>{tagForm.color}</span>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? '생성 중...' : '태그 추가'}
        </button>
      </form>
    </div>
  );
};

export { TagForm };
