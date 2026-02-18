import { supabase, ApiResponse } from '@/network/apis/common';

export async function updateComment(id: string, content: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('blog_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: '댓글 수정 중 오류가 발생했습니다.' };
  }
}
