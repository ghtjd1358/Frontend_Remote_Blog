/**
 * 사용자 통계 정보
 */
export interface UserStats {
  /** 총 게시글 수 */
  total_posts: number;
  /** 총 조회수 */
  total_views: number;
  /** 총 좋아요 수 */
  total_likes: number;
  /** 총 시리즈 수 */
  total_series: number;
}