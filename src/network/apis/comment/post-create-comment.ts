import { supabase, ApiResponse } from '@/network/apis/common';
import { CommentDetail, CreateCommentRequest } from './types';

/**
 * 새로운 블로그 댓글을 작성합니다.
 */
export async function createComment(
  params: CreateCommentRequest,
  userId?: string
): Promise<ApiResponse<CommentDetail>> {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        ...params,
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '댓글 작성 중 오류가 발생했습니다.' };
  }
}
