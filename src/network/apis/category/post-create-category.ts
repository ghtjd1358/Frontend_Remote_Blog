import { supabase, ApiResponse } from '../common';
import { CategoryDetail, CreateCategoryRequest } from './types';

/**
 * 새로운 블로그 카테고리를 생성합니다.
 */
export async function createCategory(
  userId: string,
  params: CreateCategoryRequest
): Promise<ApiResponse<CategoryDetail>> {
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .insert({
        ...params,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '카테고리 생성 중 오류가 발생했습니다.' };
  }
}
