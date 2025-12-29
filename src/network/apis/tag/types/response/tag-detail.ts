/**
 * 블로그 태그 상세 정보
 */
export interface TagDetail {
  /** 태그 ID */
  id: string;
  /** 태그명 */
  name: string;
  /** 슬러그 */
  slug: string;
  /** 색상 */
  color: string | null;
  /** 생성일시 */
  created_at: string;
}
