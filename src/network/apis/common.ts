import { supabase } from '@/network/supabase';

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 페이지네이션 응답
 */
export interface PageListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 정렬 옵션
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 게시글 상태
 */
export type PostStatus = 'draft' | 'published' | 'archived';

export { supabase };
