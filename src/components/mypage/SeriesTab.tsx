import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeriesDetail } from '@/network';
import { useSeriesMutation } from '@/hooks';
import { SeriesModal } from './SeriesModal';
import { PREFIX } from '@/config/constants';

interface SeriesTabProps {
  series: SeriesDetail[];
  isLoading?: boolean;
  isOwnProfile?: boolean;
  onRefresh?: () => void;
}

const SeriesTab: React.FC<SeriesTabProps> = ({
  series,
  isLoading,
  isOwnProfile = false,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesDetail | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { remove, isDeleting } = useSeriesMutation({
    onSuccess: () => {
      setDeleteConfirmId(null);
      onRefresh?.();
    },
  });

  const handleCreateClick = () => {
    setEditingSeries(null);
    setModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, item: SeriesDetail) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSeries(item);
    setModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await remove(deleteConfirmId);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSeries(null);
  };

  const handleModalSave = () => {
    setModalOpen(false);
    setEditingSeries(null);
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="mypage-content">
        <div className="container">
          <div className="mypage-loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-content">
      <div className="container">
        {isOwnProfile && (
          <div className="mypage-series-header">
            <button className="btn-create-series" onClick={handleCreateClick}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/>
              </svg>
              새 시리즈
            </button>
          </div>
        )}

        {series.length === 0 ? (
          <div className="mypage-empty">
            <p>생성한 시리즈가 없습니다.</p>
            {isOwnProfile && (
              <p className="mypage-empty-hint">
                시리즈를 만들어 관련 포스트를 묶어보세요.
              </p>
            )}
          </div>
        ) : (
          <div className="mypage-series-list">
            {series.map((item) => (
              <div key={item.id} className="mypage-series-item-wrapper">
                <Link
                  to={`${PREFIX}/series/${item.slug}`}
                  className="mypage-series-item"
                >
                  {item.cover_image ? (
                    <div className="mypage-series-cover">
                      <img src={item.cover_image} alt={item.title} />
                    </div>
                  ) : (
                    <div className="mypage-series-cover mypage-series-cover-empty">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </div>
                  )}
                  <div className="mypage-series-info">
                    <h3 className="mypage-series-title">{item.title}</h3>
                    {item.description && (
                      <p className="mypage-series-desc">{item.description}</p>
                    )}
                    <span className="mypage-series-count">
                      {item.posts?.length || 0}개의 포스트
                    </span>
                  </div>
                </Link>

                {isOwnProfile && (
                  <div className="mypage-series-actions">
                    <button
                      className="btn-series-action btn-edit"
                      onClick={(e) => handleEditClick(e, item)}
                      title="수정"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button
                      className="btn-series-action btn-delete"
                      onClick={(e) => handleDeleteClick(e, item.id)}
                      title="삭제"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {deleteConfirmId && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
            <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
              <h3>시리즈 삭제</h3>
              <p>이 시리즈를 삭제하시겠습니까?<br />시리즈에 포함된 포스트는 삭제되지 않습니다.</p>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                >
                  취소
                </button>
                <button
                  className="btn-confirm btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 생성/수정 모달 */}
        <SeriesModal
          isOpen={modalOpen}
          series={editingSeries}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      </div>
    </div>
  );
};

export { SeriesTab };