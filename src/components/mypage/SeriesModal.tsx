import React, { useState, useEffect } from 'react';
import { SeriesDetail, CreateSeriesRequest, UpdateSeriesRequest } from '@/network';
import { useSeriesMutation } from '@/hooks';

interface SeriesModalProps {
  isOpen: boolean;
  series: SeriesDetail | null; // null이면 생성, 있으면 수정
  onClose: () => void;
  onSave: () => void;
}

const SeriesModal: React.FC<SeriesModalProps> = ({
  isOpen,
  series,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const { create, isCreating, update, isUpdating, error, resetError } = useSeriesMutation({
    onSuccess: onSave,
  });

  const isEditing = !!series;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (series) {
        setTitle(series.title);
        setDescription(series.description || '');
        setCoverImage(series.cover_image || '');
      } else {
        setTitle('');
        setDescription('');
        setCoverImage('');
      }
      resetError();
    }
  }, [isOpen, series, resetError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    if (isEditing && series) {
      const updateData: UpdateSeriesRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        cover_image: coverImage.trim() || undefined,
      };
      await update(series.id, updateData);
    } else {
      const createData: CreateSeriesRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        cover_image: coverImage.trim() || undefined,
      };
      await create(createData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-series" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '시리즈 수정' : '새 시리즈'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="series-title">시리즈 제목 *</label>
            <input
              id="series-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="시리즈 제목을 입력하세요"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="series-description">설명</label>
            <textarea
              id="series-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="시리즈에 대한 설명을 입력하세요"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="series-cover">커버 이미지 URL</label>
            <input
              id="series-cover"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={isLoading}
            />
            {coverImage && (
              <div className="cover-preview">
                <img
                  src={coverImage}
                  alt="커버 미리보기"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isLoading || !title.trim()}
            >
              {isLoading
                ? (isEditing ? '수정 중...' : '생성 중...')
                : (isEditing ? '수정' : '생성')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { SeriesModal };
