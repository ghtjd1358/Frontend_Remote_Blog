import { supabase, ApiResponse } from '@/network/apis/common';
import { TagDetail } from './types';

interface CreateTagRequest {
  name: string;
  slug?: string;
  color?: string | null;
}

/**
 * 새로운 블로그 태그를 생성합니다.
 */
export async function createTag(params: CreateTagRequest): Promise<ApiResponse<TagDetail>> {
  try {
    const { data, error } = await supabase
      .from('blog_tags')
      .insert(params)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '태그 생성 중 오류가 발생했습니다.' };
  }
}
