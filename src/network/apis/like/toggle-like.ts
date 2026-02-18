import { supabase, ApiResponse } from '@/network/apis/common';

export interface LikeResult {
  liked: boolean;
  likeCount: number;
}

/**
 * 게시글 좋아요를 토글합니다.
 */
export async function toggleLike(postId: string, userId: string): Promise<ApiResponse<LikeResult>> {
  try {
    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Like check error:', checkError);
      return { success: false, error: checkError.message };
    }

    let liked: boolean;

    if (existingLike) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('blog_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Like delete error:', deleteError);
        return { success: false, error: deleteError.message };
      }
      liked = false;
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('blog_likes')
        .insert({ post_id: postId, user_id: userId });

      if (insertError) {
        console.error('Like insert error:', insertError);
        return { success: false, error: insertError.message };
      }
      liked = true;
    }

    // 좋아요 수 조회 (HEAD 대신 일반 쿼리 사용)
    const { data: likesData, error: countError } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', postId);

    if (countError) {
      console.error('Like count query error:', countError);
      return { success: false, error: countError.message };
    }

    const likeCount = likesData?.length || 0;

    // 게시글 like_count 업데이트
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ like_count: likeCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Like count update error:', updateError);
    }

    return {
      success: true,
      data: {
        liked,
        likeCount,
      },
    };
  } catch (err) {
    console.error('Toggle like error:', err);
    return { success: false, error: '좋아요 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 사용자가 게시글을 좋아요 했는지 확인합니다.
 */
export async function checkLiked(postId: string, userId: string): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: !!data };
  } catch (err) {
    return { success: false, error: '좋아요 확인 중 오류가 발생했습니다.' };
  }
}
