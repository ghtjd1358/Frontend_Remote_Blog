/**
 * useDeletePost - 게시글 삭제 훅
 */

import { useState, useCallback } from 'react';
import { deletePost } from '@/network';

interface UseDeletePostOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseDeletePostReturn {
  deletePost: (postId: string) => Promise<boolean>;
  isDeleting: boolean;
}

export function useDeletePost(options: UseDeletePostOptions = {}): UseDeletePostReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback((postId: string): Promise<boolean> => {
    setIsDeleting(true);

    return deletePost(postId)
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        const msg = response.error || '삭제에 실패했습니다.';
        options.onError?.(msg);
        return false;
      })
      .catch(() => {
        options.onError?.('삭제 중 오류가 발생했습니다.');
        return false;
      })
      .finally(() => setIsDeleting(false));
  }, [options]);

  return {
    deletePost: handleDelete,
    isDeleting,
  };
}
