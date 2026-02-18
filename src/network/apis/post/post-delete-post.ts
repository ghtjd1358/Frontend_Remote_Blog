import { supabase, ApiResponse } from '@/network/apis/common';

/**
 * 블로그 게시글을 삭제합니다.
 */
export async function deletePost(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: '게시글 삭제 중 오류가 발생했습니다.' };
  }
}
