import { supabase, ApiResponse } from '../common';

/**
 * 블로그 카테고리를 삭제합니다.
 */
export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: '카테고리 삭제 중 오류가 발생했습니다.' };
  }
}
