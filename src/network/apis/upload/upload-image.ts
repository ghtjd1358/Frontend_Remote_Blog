import { supabase, ApiResponse } from '@/network/apis/common';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * 이미지를 Supabase Storage에 업로드합니다.
 */
export async function uploadImage(file: File, folder: string = 'blog'): Promise<ApiResponse<UploadResult>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    };
  } catch (err) {
    return { success: false, error: '이미지 업로드 중 오류가 발생했습니다.' };
  }
}

/**
 * 여러 이미지를 동시에 업로드합니다.
 */
export async function uploadImages(files: File[], folder: string = 'blog'): Promise<ApiResponse<UploadResult[]>> {
  try {
    const results = await Promise.all(files.map(file => uploadImage(file, folder)));

    const successResults = results.filter(r => r.success && r.data);
    const failedCount = results.length - successResults.length;

    if (failedCount === results.length) {
      return { success: false, error: '모든 이미지 업로드에 실패했습니다.' };
    }

    return {
      success: true,
      data: successResults.map(r => r.data!),
    };
  } catch (err) {
    return { success: false, error: '이미지 업로드 중 오류가 발생했습니다.' };
  }
}

/**
 * 이미지를 삭제합니다.
 */
export async function deleteImage(path: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: '이미지 삭제 중 오류가 발생했습니다.' };
  }
}
