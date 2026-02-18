import React, { useState, useEffect } from 'react';
import { ProfileDetail, updateProfile, UpdateProfileRequest } from '@/network';

interface ProfileEditModalProps {
  isOpen: boolean;
  profile: ProfileDetail | null;
  onClose: () => void;
  onSave: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: '',
    short_bio: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        short_bio: profile.short_bio || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const response = await updateProfile(profile.id, formData);
      if (response.success) {
        onSave();
        onClose();
      } else {
        setError(response.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-edit-modal" onClick={e => e.stopPropagation()}>
        <h3>프로필 수정</h3>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="short_bio">한 줄 소개</label>
            <input
              type="text"
              id="short_bio"
              name="short_bio"
              value={formData.short_bio}
              onChange={handleChange}
              placeholder="짧은 소개를 입력하세요"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">소개</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="자세한 소개를 입력하세요"
              rows={6}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { ProfileEditModal };