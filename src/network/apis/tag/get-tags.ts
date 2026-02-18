import { supabase, ApiResponse } from '@/network/apis/common';
import { TagDetail } from './types';

/**
 * 블로그 태그 목록을 조회합니다.
 */
export async function getTags(): Promise<ApiResponse<TagDetail[]>> {
  try {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: '태그 조회 중 오류가 발생했습니다.' };
  }
}
