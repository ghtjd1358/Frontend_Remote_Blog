import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TiptapEditor } from '../../../components/editor';
import {
  getPostDetail,
  createPost,
  updatePost,
  getCategories,
  getTags,
  CategoryDetail,
  TagDetail,
  PostDetail,
  CreatePostRequest,
  UpdatePostRequest
} from '../../../network';
import { getCurrentUser } from '@sonhoseong/mfa-lib';

type PostStatus = 'draft' | 'published';

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  category_id: string;
  status: PostStatus;
  tagIds: string[];
  meta_title: string;
  meta_description: string;
}

const PostEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(slug);
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft',
    tagIds: [],
    meta_title: '',
    meta_description: ''
  });

  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [tags, setTags] = useState<TagDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [originalPost, setOriginalPost] = useState<PostDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          getCategories(),
          getTags()
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (tagsRes.success && tagsRes.data) {
          setTags(tagsRes.data);
        }

        if (isEditMode && slug) {
          const postRes = await getPostDetail(slug);
          if (postRes.success && postRes.data) {
            const post = postRes.data;
            setOriginalPost(post);
            setFormData({
              title: post.title,
              content: post.content || '',
              excerpt: post.excerpt || '',
              category_id: post.category?.id || '',
              status: post.status as PostStatus,
              tagIds: post.tags?.map(t => t.id) || [],
              meta_title: post.meta_title || '',
              meta_description: post.meta_description || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, slug]);

  const handleSubmit = async (status: PostStatus) => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        category_id: formData.category_id || null,
        status,
        tagIds: formData.tagIds,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null
      };

      let response;
      if (isEditMode && originalPost) {
        response = await updatePost(originalPost.id, postData as UpdatePostRequest);
      } else {
        if (!currentUser?.id) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }
        response = await createPost(currentUser.id, postData as CreatePostRequest);
      }

      if (response.success && response.data) {
        const savedPost = response.data;
        navigate(`/post/${savedPost.slug || savedPost.id}`);
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  const generateExcerpt = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const excerpt = text.substring(0, 200).trim();
    setFormData(prev => ({ ...prev, excerpt: excerpt + (text.length > 200 ? '...' : '') }));
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="post-editor-page">
      {/* 상단 헤더 */}
      <header className="editor-header">
        <div className="editor-header-left">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            ← 나가기
          </button>
        </div>
        <div className="editor-header-right">
          <button
            type="button"
            className="btn-settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            설정
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            임시저장
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit('published')}
            disabled={saving}
          >
            {saving ? '저장 중...' : (isEditMode ? '수정하기' : '발행하기')}
          </button>
        </div>
      </header>

      <div className="editor-main">
        {/* 에디터 영역 */}
        <div className="editor-content-area">
          {/* 제목 입력 */}
          <input
            type="text"
            className="editor-title-input"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          {/* 태그 선택 */}
          <div className="editor-tags">
            <div className="tags-label">태그</div>
            <div className="tags-list">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${formData.tagIds.includes(tag.id) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* TipTap 에디터 */}
          <TiptapEditor
            content={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="여기에 내용을 작성하세요..."
          />
        </div>

        {/* 사이드 설정 패널 */}
        {showSettings && (
          <aside className="editor-sidebar">
            <div className="sidebar-section">
              <h3>카테고리</h3>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="sidebar-select"
              >
                <option value="">카테고리 선택</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="sidebar-section">
              <h3>요약 (발췌문)</h3>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="글의 요약을 입력하세요"
                className="sidebar-textarea"
                rows={4}
              />
              <button
                type="button"
                className="btn-auto-excerpt"
                onClick={generateExcerpt}
              >
                본문에서 자동 추출
              </button>
            </div>

            <div className="sidebar-section">
              <h3>SEO 설정</h3>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                placeholder="메타 제목"
                className="sidebar-input"
              />
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="메타 설명"
                className="sidebar-textarea"
                rows={3}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default PostEditor;
