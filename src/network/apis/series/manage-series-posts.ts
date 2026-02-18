import { supabase, ApiResponse } from '@/network/apis/common';
import { AddPostToSeriesRequest, ReorderSeriesPostsRequest } from './types';

/**
 * 시리즈에 포스트를 추가합니다.
 */
export async function addPostToSeries(
  request: AddPostToSeriesRequest
): Promise<ApiResponse<void>> {
  try {
    // 현재 시리즈의 최대 order_index 조회
    const { data: existingPosts } = await supabase
      .from('blog_series_posts')
      .select('order_index')
      .eq('series_id', request.series_id)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = request.order_index ?? (existingPosts?.[0]?.order_index ?? 0) + 1;

    const { error } = await supabase
      .from('blog_series_posts')
      .insert({
        series_id: request.series_id,
        post_id: request.post_id,
        order_index: nextOrderIndex,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: '이미 시리즈에 포함된 포스트입니다.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: '포스트 추가 중 오류가 발생했습니다.' };
  }
}

/**
 * 시리즈에서 포스트를 제거합니다.
 */
export async function removePostFromSeries(
  seriesId: string,
  postId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('blog_series_posts')
      .delete()
      .eq('series_id', seriesId)
      .eq('post_id', postId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: '포스트 제거 중 오류가 발생했습니다.' };
  }
}

/**
 * 시리즈 내 포스트 순서를 변경합니다.
 */
export async function reorderSeriesPosts(
  request: ReorderSeriesPostsRequest
): Promise<ApiResponse<void>> {
  try {
    // 각 포스트의 순서를 업데이트
    const updates = request.post_orders.map(({ post_id, order_index }) =>
      supabase
        .from('blog_series_posts')
        .update({ order_index })
        .eq('series_id', request.series_id)
        .eq('post_id', post_id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      return { success: false, error: '순서 변경 중 일부 오류가 발생했습니다.' };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: '순서 변경 중 오류가 발생했습니다.' };
  }
}

/**
 * 특정 포스트가 속한 시리즈 목록을 조회합니다.
 */
export async function getSeriesByPostId(
  postId: string
): Promise<ApiResponse<{ series_id: string; title: string }[]>> {
  try {
    const { data, error } = await supabase
      .from('blog_series_posts')
      .select(`
        series_id,
        series:blog_series(title)
      `)
      .eq('post_id', postId);

    if (error) {
      return { success: false, error: error.message };
    }

    const result = (data || []).map((item: any) => ({
      series_id: item.series_id,
      title: item.series?.title || '',
    }));

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: '시리즈 조회 중 오류가 발생했습니다.' };
  }
}
