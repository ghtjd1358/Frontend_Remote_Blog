import { supabase, ApiResponse } from '@/network/apis/common';
import { UserStats } from './types';

/**
 * 사용자 통계를 조회합니다.
 */
export async function getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
  try {
    // 게시글 통계 조회
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, view_count, like_count')
      .eq('user_id', userId)
      .eq('status', 'published');

    if (postsError) {
      return { success: false, error: postsError.message };
    }

    // 시리즈 수 조회
    const { count: seriesCount, error: seriesError } = await supabase
      .from('blog_series')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (seriesError) {
      return { success: false, error: seriesError.message };
    }

    const stats: UserStats = {
      total_posts: posts?.length || 0,
      total_views: posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0,
      total_likes: posts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0,
      total_series: seriesCount || 0,
    };

    return { success: true, data: stats };
  } catch (err) {
    return { success: false, error: '통계 조회 중 오류가 발생했습니다.' };
  }
}