import { supabase, ApiResponse } from '@/network/apis/common';
import { SeriesDetail, CreateSeriesRequest } from './types';
import { getCurrentUser } from '@sonhoseong/mfa-lib';

/**
 * 슬러그 생성 (한글 지원)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * 새 시리즈를 생성합니다.
 */
export async function createSeries(
  request: CreateSeriesRequest
): Promise<ApiResponse<SeriesDetail>> {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const slug = generateSlug(request.title);

    // 현재 사용자의 최대 order_index 조회
    const { data: existingSeries } = await supabase
      .from('blog_series')
      .select('order_index')
      .eq('user_id', user.id)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingSeries?.[0]?.order_index ?? 0 + 1;

    const { data, error } = await supabase
      .from('blog_series')
      .insert({
        user_id: user.id,
        title: request.title,
        slug,
        description: request.description || null,
        cover_image: request.cover_image || null,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: '이미 같은 이름의 시리즈가 있습니다.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '시리즈 생성 중 오류가 발생했습니다.' };
  }
}
