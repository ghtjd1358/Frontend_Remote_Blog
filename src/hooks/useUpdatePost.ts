/**
 * useUpdatePost - 게시글 수정 훅
 */

import { useState, useCallback } from 'react';
import { updatePost, UpdatePostRequest } from '@/network';

interface UseUpdatePostOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseUpdatePostReturn {
  updatePost: (id: string, data: UpdatePostRequest) => Promise<boolean>;
  isUpdating: boolean;
}

export function useUpdatePost(options: UseUpdatePostOptions = {}): UseUpdatePostReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = useCallback((id: string, data: UpdatePostRequest): Promise<boolean> => {
    setIsUpdating(true);

    return updatePost(id, data)
      .then((response) => {
        if (response.success) {
          options.onSuccess?.();
          return true;
        }
        const msg = response.error || '수정에 실패했습니다.';
        options.onError?.(msg);
        return false;
      })
      .catch(() => {
        options.onError?.('수정 중 오류가 발생했습니다.');
        return false;
      })
      .finally(() => setIsUpdating(false));
  }, [options]);

  return {
    updatePost: handleUpdate,
    isUpdating,
  };
}
