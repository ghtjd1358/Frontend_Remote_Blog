import { supabase, ApiResponse } from '@/network/apis/common';
import { SeriesDetail, UpdateSeriesRequest } from './types';

/**
 * 시리즈를 수정합니다.
 */
export async function updateSeries(
  seriesId: string,
  request: UpdateSeriesRequest
): Promise<ApiResponse<SeriesDetail>> {
  try {
    const updateData: Record<string, unknown> = {};

    if (request.title !== undefined) updateData.title = request.title;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.cover_image !== undefined) updateData.cover_image = request.cover_image;
    if (request.order_index !== undefined) updateData.order_index = request.order_index;

    const { data, error } = await supabase
      .from('blog_series')
      .update(updateData)
      .eq('id', seriesId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '시리즈 수정 중 오류가 발생했습니다.' };
  }
}
