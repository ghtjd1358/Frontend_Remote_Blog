import { supabase, ApiResponse } from '@/network/apis/common';
import { CommentDetail } from './types';

/**
 * 블로그 댓글 목록을 조회합니다.
 */
export async function getComments(postId: string): Promise<ApiResponse<CommentDetail[]>> {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        author:profiles(id, name, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    // 트리 구조로 변환
    const commentTree = buildCommentTree(data || []);

    return { success: true, data: commentTree };
  } catch (err) {
    return { success: false, error: '댓글 조회 중 오류가 발생했습니다.' };
  }
}

function buildCommentTree(comments: any[]): CommentDetail[] {
  const commentMap: Record<string, any> = {};
  const rootComments: CommentDetail[] = [];

  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  comments.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap[comment.parent_id];
      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    } else {
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
}
