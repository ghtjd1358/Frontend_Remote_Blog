import { supabase, ApiResponse } from '@/network/apis/common';
import { ProfileDetail } from './types';

export interface UpdateProfileRequest {
  name?: string;
  avatar_url?: string;
  bio?: string;
  short_bio?: string;
}

/**
 * 사용자 프로필을 수정합니다.
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest
): Promise<ApiResponse<ProfileDetail>> {
  try {
    const { data: result, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: '프로필 수정 중 오류가 발생했습니다.' };
  }
}