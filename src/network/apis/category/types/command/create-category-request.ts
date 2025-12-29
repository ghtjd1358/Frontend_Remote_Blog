/**
 * 블로그 카테고리 생성 요청
 */
export interface CreateCategoryRequest {
  /** 카테고리명 */
  name: string;
  /** 슬러그 */
  slug?: string;
  /** 설명 */
  description?: string | null;
  /** 아이콘 */
  icon?: string | null;
  /** 색상 */
  color?: string | null;
  /** 정렬 순서 */
  order_index?: number;
}
