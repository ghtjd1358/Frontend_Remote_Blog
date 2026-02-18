/**
 * usePostEditorData - 에디터 초기 데이터 페칭 훅
 * 태그 목록 + 수정 시 기존 포스트 데이터
 */

import { useState, useEffect } from 'react';
import { getTags, getPostDetail, TagDetail, PostDetail } from '@/network';

type PostStatus = 'draft' | 'published';

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  status: PostStatus;
  tagIds: string[];
  meta_title: string;
  meta_description: string;
}

interface UsePostEditorDataReturn {
  tags: TagDetail[];
  originalPost: PostDetail | null;
  initialFormData: PostFormData;
  isLoading: boolean;
}

const DEFAULT_FORM_DATA: PostFormData = {
  title: '',
  content: '',
  excerpt: '',
  status: 'draft',
  tagIds: [],
  meta_title: '',
  meta_description: '',
};

export function usePostEditorData(slug: string | undefined): UsePostEditorDataReturn {
  const [tags, setTags] = useState<TagDetail[]>([]);
  const [originalPost, setOriginalPost] = useState<PostDetail | null>(null);
  const [initialFormData, setInitialFormData] = useState<PostFormData>(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(slug);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // 태그 페칭
    const tagsPromise = getTags().then((res) => {
      if (res.success && res.data) {
        setTags(res.data);
      }
    });

    // 수정 모드면 포스트 데이터도 페칭
    const postPromise = isEditMode && slug
      ? getPostDetail(slug, true, false).then((res) => {
          if (res.success && res.data) {
            const post = res.data;
            setOriginalPost(post);
            setInitialFormData({
              title: post.title,
              content: post.content || '',
              excerpt: post.excerpt || '',
              status: post.status as PostStatus,
              tagIds: post.tags?.map((t) => t.id) || [],
              meta_title: post.meta_title || '',
              meta_description: post.meta_description || '',
            });
          } else {
            setError(res.error || '게시글을 불러올 수 없습니다.');
          }
        })
      : Promise.resolve();

    Promise.all([tagsPromise, postPromise])
      .catch(() => setError('데이터 로딩 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false));
  }, [slug, isEditMode]);

  // 에러가 있으면 throw → ErrorBoundary가 처리
  if (error) {
    throw new Error(error);
  }

  return { tags, originalPost, initialFormData, isLoading };
}
