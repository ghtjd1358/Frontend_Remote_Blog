import { PostSummary } from './post-summary';

/**
 * 블로그 게시글 상세 정보
 */
export interface PostDetail extends PostSummary {
  /** 내용 */
  content: string | null;
  /** 메타 제목 */
  meta_title?: string | null;
  /** 메타 설명 */
  meta_description?: string | null;
  /** 수정일시 */
  updated_at: string;
  /** 태그 목록 */
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
}
