import { supabase, ApiResponse } from '@/network/apis/common';

export async function deleteComment(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('blog_comments')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' };
  }
}
