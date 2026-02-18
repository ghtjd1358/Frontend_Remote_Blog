import { supabase, ApiResponse } from '@/network/apis/common';
import { ProfileDetail } from './types';

/**
 * 사용자 프로필을 조회합니다.
 */
export async function getProfile(userId: string): Promise<ApiResponse<ProfileDetail>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: '프로필 조회 중 오류가 발생했습니다.' };
  }
}