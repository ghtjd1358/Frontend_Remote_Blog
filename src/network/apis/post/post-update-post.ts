import { supabase, ApiResponse } from '@/network/apis/common';
import { PostDetail, UpdatePostRequest } from './types';

/**
 * 블로그 게시글을 수정합니다.
 */
export async function updatePost(
  id: string,
  params: UpdatePostRequest
): Promise<ApiResponse<PostDetail>> {
  try {
    const { tagIds, meta_title, meta_description, ...postData } = params;

    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 태그 업데이트
    if (tagIds !== undefined) {
      await supabase.from('blog_post_tags').delete().eq('post_id', id);
      if (tagIds.length > 0) {
        await supabase.from('blog_post_tags').insert(
          tagIds.map((tagId) => ({
            post_id: id,
            tag_id: tagId,
          }))
        );
      }
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '게시글 수정 중 오류가 발생했습니다.' };
  }
}
