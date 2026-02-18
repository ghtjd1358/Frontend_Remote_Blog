import { PostStatus } from '@/network/apis/common';

/**
 * 블로그 게시글 수정 요청
 */
export interface UpdatePostRequest {
  /** 제목 */
  title?: string;
  /** 슬러그 */
  slug?: string;
  /** 내용 */
  content?: string;
  /** 발췌문 */
  excerpt?: string | null;
  /** 커버 이미지 */
  cover_image?: string | null;
  /** 상태 */
  status?: PostStatus;
  /** 추천 여부 */
  is_featured?: boolean;
  /** 상단 고정 여부 */
  is_pinned?: boolean;
  /** 메타 제목 */
  meta_title?: string | null;
  /** 메타 설명 */
  meta_description?: string | null;
  /** 태그 ID 목록 */
  tagIds?: string[];
}
