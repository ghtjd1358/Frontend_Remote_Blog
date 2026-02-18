import {ApiResponse, SeriesDetail, supabase} from "@/network";


/**
 * 블로그 시리즈 목록을 조회합니다.
 */
export async function getSeries(userId?: string): Promise<ApiResponse<SeriesDetail[]>> {
  try {
    let query = supabase
      .from('blog_series')
      .select(`
        *,
        posts:blog_series_posts(
          order_index,
          post:blog_posts(id, title, slug, status)
        )
      `)
      .order('order_index', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: '시리즈 조회 중 오류가 발생했습니다.' };
  }
}
