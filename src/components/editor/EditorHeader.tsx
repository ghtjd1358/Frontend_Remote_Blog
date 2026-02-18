import React from 'react';
import { Button } from '@/components';

interface EditorHeaderProps {
  isEditMode: boolean;
  isSaving: boolean;
  showSettings: boolean;
  onBack: () => void;
  onToggleSettings: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  isEditMode,
  isSaving,
  showSettings,
  onBack,
  onToggleSettings,
  onSaveDraft,
  onPublish,
}) => {
  return (
    <header className="editor-header">
      <div className="editor-header-left">
        <button type="button" className="btn-back" onClick={onBack}>
          ← 나가기
        </button>
      </div>
      <div className="editor-header-right">
        <button
          type="button"
          className={`btn-settings ${showSettings ? 'active' : ''}`}
          onClick={onToggleSettings}
        >
          설정
        </button>
        <Button variant="secondary" onClick={onSaveDraft} disabled={isSaving}>
          임시저장
        </Button>
        <Button variant="primary" onClick={onPublish} disabled={isSaving}>
          {isSaving ? '저장 중...' : isEditMode ? '수정하기' : '발행하기'}
        </Button>
      </div>
    </header>
  );
};

export { EditorHeader };
