import { supabase, ApiResponse, PageListResponse } from '@/network/apis/common';
import { PostSummary, PostSearchCondition } from './types';

const BLOG_START_DATE = new Date('2026-02-09');

export interface PostsWithStats extends PageListResponse<PostSummary> {
  stats: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    daysRunning: number;
  };
}

/**
 * 블로그 게시글 목록을 조회합니다.
 */
export async function getPosts(
  params: PostSearchCondition = {}
): Promise<ApiResponse<PostsWithStats>> {
  try {
    const { page = 1, limit = 10, status, isFeatured, search, userId, tagId } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' });

    // 필터 적용
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'published');
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

    // 각 포스트에 태그 정보 추가
    const postsWithTags = await Promise.all(
      (data || []).map(async (post) => {
        const { data: postTags } = await supabase
          .from('blog_post_tags')
          .select('tag:blog_tags(id, name, slug)')
          .eq('post_id', post.id);

        return {
          ...post,
          tags: postTags?.map((pt: any) => pt.tag).filter(Boolean) || [],
        };
      })
    );

    // 전체 통계 조회 (published만)
    const { data: allPosts } = await supabase
      .from('blog_posts')
      .select('view_count, like_count')
      .eq('status', 'published');

    const totalPosts = allPosts?.length || 0;
    const totalViews = allPosts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
    const totalLikes = allPosts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0;
    const daysRunning = Math.floor((Date.now() - BLOG_START_DATE.getTime()) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      data: {
        data: postsWithTags,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        stats: { totalPosts, totalViews, totalLikes, daysRunning },
      },
    };
  } catch (err) {
    return { success: false, error: '게시글 목록 조회 중 오류가 발생했습니다.' };
  }
}
