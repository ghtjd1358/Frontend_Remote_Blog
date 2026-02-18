/**
 * usePostDetail Hook
 * 게시글 상세 조회 + 콘텐츠 파싱 + Shiki 하이라이팅
 */

import { useEffect, useState } from 'react';
import { getPostDetail, PostDetail } from '@/network';
import { parseContent, applyShikiHighlighting } from '@/utils/contentParser';
import { enhanceCodeBlocks } from '@/utils/codeBlockEnhancer';

interface UsePostDetailOptions {
  incrementView?: boolean;
  enableHighlighting?: boolean;
}

interface UsePostDetailReturn {
  post: PostDetail | null;
  parsedContent: string;
  isLoading: boolean;
}

export function usePostDetail(
  slug: string | undefined,
  options: UsePostDetailOptions = {}
): UsePostDetailReturn {
  const { incrementView = true, enableHighlighting = true } = options;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [parsedContent, setParsedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 게시글 조회
  useEffect(() => {
    if (!slug) {
      setError('게시글 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    getPostDetail(slug, incrementView)
      .then((response) => {
        if (response.success && response.data) {
          setPost(response.data);
        } else {
          setError(response.error || '게시글을 찾을 수 없습니다.');
        }
      })
      .catch(() => setError('게시글을 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false));
  }, [slug, incrementView]);

  // 콘텐츠 파싱 및 하이라이팅
  useEffect(() => {
    if (!post?.content) {
      setParsedContent('');
      return;
    }

    // 1. 기본 파싱
    const basicParsed = parseContent(post.content);
    setParsedContent(basicParsed);

    // 2. Shiki 하이라이팅 (옵션)
    if (enableHighlighting) {
      applyShikiHighlighting(basicParsed)
        .then((highlighted) => {
          setParsedContent(highlighted);
          requestAnimationFrame(() => enhanceCodeBlocks('.post-content'));
        })
        .catch((err) => console.error('[usePostDetail] Shiki error:', err));
    }
  }, [post?.content, enableHighlighting]);

  // 코드 블록 enhance
  useEffect(() => {
    if (parsedContent) {
      const timer = setTimeout(() => enhanceCodeBlocks('.post-content'), 100);
      return () => clearTimeout(timer);
    }
  }, [parsedContent]);

  // 에러가 있으면 throw → ErrorBoundary가 처리
  if (error) {
    throw new Error(error);
  }

  return { post, parsedContent, isLoading };
}
