import { supabase, ApiResponse } from '@/network/apis/common';
import { CategoryDetail } from './types';

/**
 * 블로그 카테고리 목록을 조회합니다.
 */
export async function getCategories(userId?: string): Promise<ApiResponse<CategoryDetail[]>> {
  try {
    let query = supabase
      .from('blog_categories')
      .select('*')
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
    return { success: false, error: '카테고리 조회 중 오류가 발생했습니다.' };
  }
}
