import { useState, useCallback } from 'react';
import { createPost, CreatePostRequest } from '@/network';

interface UseCreatePostOptions {
  onSuccess?: (id: string) => void;
  onError?: (error: string) => void;
}

interface UseCreatePostReturn {
  createPost: (data: CreatePostRequest) => Promise<string>;
  isCreating: boolean;
}

export function useCreatePost(options: UseCreatePostOptions = {}): UseCreatePostReturn {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback((data: CreatePostRequest): Promise<string> => {
    setIsCreating(true);

    return createPost(data)
      .then((response) => {
        if (response.success && response.data) {
          options.onSuccess?.(response.data.id);
          return response.data.id;
        }
        const msg = response.error || '게시글 작성에 실패했습니다.';
        options.onError?.(msg);
        return '';
      })
      .catch(() => {
        options.onError?.('게시글 작성 중 오류가 발생했습니다.');
        return '';
      })
      .finally(() => setIsCreating(false));
  }, [options]);

  return {
    createPost: handleCreate,
    isCreating,
  };
}
