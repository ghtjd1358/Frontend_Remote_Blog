import { supabase, ApiResponse } from '../common';
import { PostDetail, CreatePostRequest } from './types';

/**
 * 새로운 블로그 게시글을 생성합니다.
 */
export async function createPost(
  userId: string,
  params: CreatePostRequest
): Promise<ApiResponse<PostDetail>> {
  try {
    const { tagIds, meta_title, meta_description, ...postData } = params;

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...postData,
        user_id: userId,
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 태그 연결
    if (tagIds && tagIds.length > 0) {
      await supabase.from('blog_post_tags').insert(
        tagIds.map((tagId) => ({
          post_id: data.id,
          tag_id: tagId,
        }))
      );
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '게시글 생성 중 오류가 발생했습니다.' };
  }
}
