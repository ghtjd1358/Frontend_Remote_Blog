import { supabase, ApiResponse } from '@/network/apis/common';
import { PostDetail, CreatePostRequest } from './types';

const generateSlug = (title: string): string => {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-') +
    '-' +
    Date.now()
  );
};

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
        slug: generateSlug(postData.title),
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
