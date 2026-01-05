import { supabase, ApiResponse, PageListResponse } from '../common';
import { PostSummary, PostSearchCondition } from './types';

/**
 * 블로그 게시글 목록을 조회합니다.
 */
export async function getPosts(
  params: PostSearchCondition = {}
): Promise<ApiResponse<PageListResponse<PostSummary>>> {
  try {
    const { page = 1, limit = 10, categoryId, status, isFeatured, search, userId } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(id, name, slug)
      `, { count: 'exact' });

    // 필터 적용
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'published');
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 정렬 및 페이지네이션
    query = query
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (err) {
    return { success: false, error: '게시글 목록 조회 중 오류가 발생했습니다.' };
  }
}
