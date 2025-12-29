/**
 * 블로그 댓글 상세 정보
 */
export interface CommentDetail {
  /** 댓글 ID */
  id: string;
  /** 게시글 ID */
  post_id: string;
  /** 사용자 ID */
  user_id: string | null;
  /** 부모 댓글 ID */
  parent_id: string | null;
  /** 내용 */
  content: string;
  /** 작성자 이름 (비회원) */
  author_name: string | null;
  /** 작성자 이메일 (비회원) */
  author_email: string | null;
  /** 승인 여부 */
  is_approved: boolean;
  /** 삭제 여부 */
  is_deleted: boolean;
  /** 생성일시 */
  created_at: string;
  /** 작성자 정보 */
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  /** 대댓글 목록 */
  replies?: CommentDetail[];
}
