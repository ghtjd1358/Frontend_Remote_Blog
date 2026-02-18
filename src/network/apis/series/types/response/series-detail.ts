/**
 * 블로그 시리즈 상세 정보
 */
export interface SeriesDetail {
  /** 시리즈 ID */
  id: string;
  /** 사용자 ID */
  user_id: string;
  /** 시리즈명 */
  title: string;
  /** 슬러그 */
  slug: string;
  /** 설명 */
  description: string | null;
  /** 커버 이미지 */
  cover_image: string | null;
  /** 정렬 순서 */
  order_index: number;
  /** 생성일시 */
  created_at: string;
  /** 게시글 목록 */
  posts?: {
    order_index: number;
    post: {
      id: string;
      title: string;
      slug: string;
      status: string;
    };
  }[];
}

/**
 * 시리즈 상세 페이지용 (포스트 전체 정보 포함)
 */
export interface SeriesDetailFull {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  order_index: number;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  posts: {
    order_index: number;
    post: {
      id: string;
      title: string;
      slug: string;
      summary: string | null;
      thumbnail: string | null;
      status: string;
      created_at: string;
      view_count: number;
    };
  }[];
}
