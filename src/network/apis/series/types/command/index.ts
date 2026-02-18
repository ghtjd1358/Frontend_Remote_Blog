/**
 * 시리즈 생성 요청
 */
export interface CreateSeriesRequest {
  title: string;
  description?: string;
  cover_image?: string;
}

/**
 * 시리즈 수정 요청
 */
export interface UpdateSeriesRequest {
  title?: string;
  description?: string;
  cover_image?: string;
  order_index?: number;
}

/**
 * 시리즈에 포스트 추가 요청
 */
export interface AddPostToSeriesRequest {
  series_id: string;
  post_id: string;
  order_index?: number;
}

/**
 * 시리즈 포스트 순서 변경 요청
 */
export interface ReorderSeriesPostsRequest {
  series_id: string;
  post_orders: { post_id: string; order_index: number }[];
}
