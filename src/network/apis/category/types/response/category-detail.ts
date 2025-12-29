/**
 * 블로그 카테고리 상세 정보
 */
export interface CategoryDetail {
  /** 카테고리 ID */
  id: string;
  /** 사용자 ID */
  user_id: string;
  /** 카테고리명 */
  name: string;
  /** 슬러그 */
  slug: string;
  /** 설명 */
  description: string | null;
  /** 아이콘 */
  icon: string | null;
  /** 색상 */
  color: string | null;
  /** 정렬 순서 */
  order_index: number;
  /** 생성일시 */
  created_at: string;
}
