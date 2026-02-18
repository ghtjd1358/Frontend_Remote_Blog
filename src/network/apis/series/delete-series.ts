import { supabase, ApiResponse } from '@/network/apis/common';

/**
 * 시리즈를 삭제합니다.
 * 시리즈에 포함된 포스트는 삭제되지 않고, 연결만 해제됩니다.
 */
export async function deleteSeries(seriesId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('blog_series')
      .delete()
      .eq('id', seriesId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: '시리즈 삭제 중 오류가 발생했습니다.' };
  }
}
