/**
 * useSeries Hooks
 * 시리즈 관련 데이터 및 뮤테이션
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSeries,
  getSeriesDetail,
  createSeries,
  updateSeries,
  deleteSeries,
  addPostToSeries,
  removePostFromSeries,
  reorderSeriesPosts,
  getSeriesByPostId,
  SeriesDetail,
  SeriesDetailFull,
  CreateSeriesRequest,
  UpdateSeriesRequest,
} from '@/network';

// ============================================
// useSeries - 시리즈 목록 조회
// ============================================

interface UseSeriesReturn {
  series: SeriesDetail[];
  isLoading: boolean;
}

export function useSeries(userId?: string): UseSeriesReturn {
  const [series, setSeries] = useState<SeriesDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getSeries(userId)
      .then((response) => {
        if (response.success && response.data) {
          setSeries(response.data);
        } else {
          setError(response.error || '시리즈를 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('시리즈 조회 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false));
  }, [userId]);

  // 에러가 있으면 throw → ErrorBoundary가 처리
  if (error) {
    throw new Error(error);
  }

  return { series, isLoading };
}

// ============================================
// useSeriesMutation - 시리즈 CRUD
// ============================================

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseSeriesMutationReturn {
  create: (data: CreateSeriesRequest) => Promise<SeriesDetail | null>;
  isCreating: boolean;
  update: (id: string, data: UpdateSeriesRequest) => Promise<boolean>;
  isUpdating: boolean;
  remove: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
  resetError: () => void;
}

export function useSeriesMutation(options: MutationOptions = {}): UseSeriesMutationReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback((data: CreateSeriesRequest): Promise<SeriesDetail | null> => {
    setIsCreating(true);
    setError(null);

    return createSeries(data)
      .then((response) => {
        if (response.success && response.data) {
          options.onSuccess?.();
          return response.data;
        }
        const msg = response.error || '시리즈 생성에 실패했습니다.';
        setError(msg);
        options.onError?.(msg);
        return null;
      })
      .catch(() => {
        const msg = '시리즈 생성 중 오류가 발생했습니다.';
        setError(msg);
        options.onError?.(msg);
        return null;
      })
      .finally(() => setIsCreating(false));
  }, [options]);

  const update = useCallback((id: string, data: UpdateSeriesRequest): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    return updateSeries(id, data)
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        const msg = response.error || '시리즈 수정에 실패했습니다.';
        setError(msg);
        options.onError?.(msg);
        return false;
      })
      .catch(() => {
        const msg = '시리즈 수정 중 오류가 발생했습니다.';
        setError(msg);
        options.onError?.(msg);
        return false;
      })
      .finally(() => setIsUpdating(false));
  }, [options]);

  const remove = useCallback((id: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    return deleteSeries(id)
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        const msg = response.error || '시리즈 삭제에 실패했습니다.';
        setError(msg);
        options.onError?.(msg);
        return false;
      })
      .catch(() => {
        const msg = '시리즈 삭제 중 오류가 발생했습니다.';
        setError(msg);
        options.onError?.(msg);
        return false;
      })
      .finally(() => setIsDeleting(false));
  }, [options]);

  const resetError = useCallback(() => setError(null), []);

  return {
    create,
    isCreating,
    update,
    isUpdating,
    remove,
    isDeleting,
    error,
    resetError,
  };
}

// ============================================
// useSeriesPostsMutation - 시리즈 포스트 관리
// ============================================

interface UseSeriesPostsMutationReturn {
  addPost: (seriesId: string, postId: string) => Promise<boolean>;
  removePost: (seriesId: string, postId: string) => Promise<boolean>;
  reorderPosts: (seriesId: string, postOrders: { post_id: string; order_index: number }[]) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useSeriesPostsMutation(options: MutationOptions = {}): UseSeriesPostsMutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPost = useCallback((seriesId: string, postId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    return addPostToSeries({ series_id: seriesId, post_id: postId })
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        setError(response.error || '포스트 추가에 실패했습니다.');
        options.onError?.(response.error || '');
        return false;
      })
      .catch(() => {
        setError('포스트 추가 중 오류가 발생했습니다.');
        return false;
      })
      .finally(() => setIsLoading(false));
  }, [options]);

  const removePost = useCallback((seriesId: string, postId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    return removePostFromSeries(seriesId, postId)
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        setError(response.error || '포스트 제거에 실패했습니다.');
        options.onError?.(response.error || '');
        return false;
      })
      .catch(() => {
        setError('포스트 제거 중 오류가 발생했습니다.');
        return false;
      })
      .finally(() => setIsLoading(false));
  }, [options]);

  const reorderPosts = useCallback((
    seriesId: string,
    postOrders: { post_id: string; order_index: number }[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    return reorderSeriesPosts({ series_id: seriesId, post_orders: postOrders })
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        setError(response.error || '순서 변경에 실패했습니다.');
        return false;
      })
      .catch(() => {
        setError('순서 변경 중 오류가 발생했습니다.');
        return false;
      })
      .finally(() => setIsLoading(false));
  }, [options]);

  return { addPost, removePost, reorderPosts, isLoading, error };
}

// ============================================
// usePostSeries - 포스트가 속한 시리즈 조회
// ============================================

interface UsePostSeriesReturn {
  series: { series_id: string; title: string }[];
  isLoading: boolean;
}

export function usePostSeries(postId: string | undefined): UsePostSeriesReturn {
  const [series, setSeries] = useState<{ series_id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;

    setIsLoading(true);

    getSeriesByPostId(postId)
      .then((response) => {
        if (response.success && response.data) {
          setSeries(response.data);
        }
      })
      .catch((err) => console.error('Failed to fetch post series:', err))
      .finally(() => setIsLoading(false));
  }, [postId]);

  return { series, isLoading };
}

// ============================================
// useSeriesDetail - 시리즈 상세 조회
// ============================================

interface UseSeriesDetailReturn {
  series: SeriesDetailFull | null;
  isLoading: boolean;
}

export function useSeriesDetail(slug: string | undefined): UseSeriesDetailReturn {
  const [series, setSeries] = useState<SeriesDetailFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('시리즈 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    getSeriesDetail(slug)
      .then((response) => {
        if (response.success && response.data) {
          setSeries(response.data);
        } else {
          setError(response.error || '시리즈를 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('시리즈 조회 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // 에러가 있으면 throw → ErrorBoundary가 처리
  if (error) {
    throw new Error(error);
  }

  return { series, isLoading };
}
