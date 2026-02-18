import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

const SUPABASE_URL = 'https://ujhlgylnauzluttvmcrz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDA0MjcsImV4cCI6MjA4MTA3NjQyN30.UcOpbc6QDU-J2s_6eI5vEehvbgSRMCSHIjkFiHb0oRo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// marked 설정
marked.setOptions({
  gfm: true,
  breaks: true,
});

async function convertAllPosts() {
  console.log('포스트 조회 중...');

  // 모든 포스트 가져오기
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, content')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('조회 실패:', error);
    return;
  }

  console.log(`총 ${posts.length}개 포스트 변환 시작\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const post of posts) {
    // 이미 HTML인지 확인 (간단한 체크)
    if (post.content && post.content.trim().startsWith('<')) {
      console.log('[스킵]', post.title, '- 이미 HTML');
      skipCount++;
      continue;
    }

    if (!post.content) {
      console.log('[스킵]', post.title, '- 내용 없음');
      skipCount++;
      continue;
    }

    try {
      // Markdown → HTML 변환
      const htmlContent = marked.parse(post.content);

      // DB 업데이트
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ content: htmlContent })
        .eq('id', post.id);

      if (updateError) {
        console.log('[실패]', post.title, '-', updateError.message);
        failCount++;
      } else {
        console.log('[완료]', post.title);
        successCount++;
      }
    } catch (err) {
      console.log('[실패]', post.title, '-', err.message);
      failCount++;
    }
  }

  console.log('\n=== 변환 완료 ===');
  console.log('성공:', successCount);
  console.log('스킵:', skipCount);
  console.log('실패:', failCount);
}

convertAllPosts();
