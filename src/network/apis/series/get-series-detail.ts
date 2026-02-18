import { supabase, ApiResponse } from '@/network/apis/common';
import { SeriesDetailFull } from './types';

/**
 * 시리즈 상세 정보를 slug로 조회합니다.
 */
export async function getSeriesDetail(slug: string): Promise<ApiResponse<SeriesDetailFull>> {
  try {
    const { data, error } = await supabase
      .from('blog_series')
      .select(`
        *,
        user:profiles(id, username, avatar_url),
        posts:blog_series_posts(
          order_index,
          post:blog_posts(
            id,
            title,
            slug,
            summary,
            thumbnail,
            status,
            created_at,
            view_count
          )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: '시리즈를 찾을 수 없습니다.' };
      }
      return { success: false, error: error.message };
    }

    // posts를 order_index 순으로 정렬
    if (data.posts) {
      data.posts.sort((a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index
      );
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '시리즈 조회 중 오류가 발생했습니다.' };
  }
}
