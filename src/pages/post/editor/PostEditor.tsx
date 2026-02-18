import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, useToast } from '@sonhoseong/mfa-lib';
import { TiptapEditor, EditorHeader, TagSelector, EditorSidebar } from '@/components/editor';
import { LoadingSpinner } from '@/components/loading';
import { usePostEditorData, useCreatePost, useUpdatePost, PostFormData } from '@/hooks';
import { CreatePostRequest, UpdatePostRequest } from '@/network';
import { PREFIX } from '@/config/constants';

type PostStatus = 'draft' | 'published';

const PostEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = getCurrentUser();
  const isEditMode = Boolean(slug);

  // 데이터 페칭
  const { tags, originalPost, initialFormData, isLoading } = usePostEditorData(slug);

  // 뮤테이션
  const { createPost, isCreating } = useCreatePost({
    onSuccess: (id) => navigate(`${PREFIX}/post/${id}`),
    onError: (err) => toast.error(err),
  });

  const { updatePost, isUpdating } = useUpdatePost({
    onSuccess: () => {
      toast.success('게시글이 수정되었습니다.');
      navigate(`${PREFIX}/post/${originalPost?.slug || originalPost?.id}`);
    },
    onError: (err) => toast.error(err),
  });

  // 폼 상태
  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [showSettings, setShowSettings] = useState(false);

  // initialFormData가 변경되면 formData 업데이트 (수정 모드에서 데이터 로드 후)
  React.useEffect(() => {
    if (initialFormData.title) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  const isSaving = isCreating || isUpdating;

  // 제출 핸들러
  const handleSubmit = useCallback((status: PostStatus) => {
    if (!formData.title.trim()) {
      toast.warning('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      toast.warning('내용을 입력해주세요.');
      return;
    }

    const postData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || null,
      status,
      tagIds: formData.tagIds,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
    };

    if (isEditMode && originalPost) {
      updatePost(originalPost.id, postData as UpdatePostRequest);
    } else {
      if (!currentUser?.id) {
        toast.error('로그인이 필요합니다.');
        navigate(`${PREFIX}/login`);
        return;
      }
      createPost({ ...postData, user_id: currentUser.id } as CreatePostRequest);
    }
  }, [formData, isEditMode, originalPost, currentUser, createPost, updatePost, navigate, toast]);

  // 태그 토글
  const handleTagToggle = useCallback((tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  }, []);

  // 폼 필드 업데이트
  const updateField = useCallback(<K extends keyof PostFormData>(
    field: K,
    value: PostFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (isLoading) {
    return <LoadingSpinner className="editor-loading" />;
  }

  return (
    <div className="post-editor-page">
      <EditorHeader
        isEditMode={isEditMode}
        isSaving={isSaving}
        showSettings={showSettings}
        onBack={() => navigate(-1)}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onSaveDraft={() => handleSubmit('draft')}
        onPublish={() => handleSubmit('published')}
      />

      <div className="editor-main">
        <div className="editor-content-area">
          <input
            type="text"
            className="editor-title-input"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <TagSelector
            tags={tags}
            selectedTagIds={formData.tagIds}
            onTagToggle={handleTagToggle}
          />

          <TiptapEditor
            key={originalPost?.id || 'new'}
            content={formData.content}
            onChange={(content) => updateField('content', content)}
            placeholder="여기에 내용을 작성하세요..."
          />
        </div>

        {showSettings && (
          <EditorSidebar
            excerpt={formData.excerpt}
            metaTitle={formData.meta_title}
            metaDescription={formData.meta_description}
            onExcerptChange={(value) => updateField('excerpt', value)}
            onMetaTitleChange={(value) => updateField('meta_title', value)}
            onMetaDescriptionChange={(value) => updateField('meta_description', value)}
          />
        )}
      </div>
    </div>
  );
};

export default PostEditor;
