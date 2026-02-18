/**
 * 블로그 게시글 요약 정보
 */
export interface PostSummary {
  /** 게시글 ID */
  id: string;
  /** 사용자 ID */
  user_id: string;
  /** 제목 */
  title: string;
  /** 슬러그 */
  slug: string;
  /** 발췌문 */
  excerpt: string | null;
  /** 커버 이미지 */
  cover_image: string | null;
  /** 상태 */
  status: string;
  /** 추천 여부 */
  is_featured: boolean;
  /** 상단 고정 여부 */
  is_pinned: boolean;
  /** 조회수 */
  view_count: number;
  /** 좋아요 수 */
  like_count: number;
  /** 댓글 수 */
  comment_count: number;
  /** 발행일시 */
  published_at: string | null;
  /** 생성일시 */
  created_at: string;
  /** 작성자 정보 */
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  /** 태그 목록 */
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
}
