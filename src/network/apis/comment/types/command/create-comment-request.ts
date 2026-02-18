/**
 * 블로그 댓글 작성 요청
 */
export interface CreateCommentRequest {
  /** 게시글 ID */
  post_id: string;
  /** 내용 */
  content: string;
  /** 부모 댓글 ID */
  parent_id?: string | null;
  /** 작성자 이름 (비회원) */
  author_name?: string | null;
  /** 작성자 이메일 (비회원) */
  author_email?: string | null;
}
