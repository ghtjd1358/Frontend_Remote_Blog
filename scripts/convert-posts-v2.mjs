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

async function testUpdate() {
  // 1개만 테스트
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, title, content')
    .limit(1)
    .single();

  console.log('원본 (처음 100자):', post.content.substring(0, 100));

  // 변환
  const htmlContent = marked.parse(post.content);
  console.log('\n변환 후 (처음 100자):', htmlContent.substring(0, 100));

  // 업데이트 시도
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content: htmlContent })
    .eq('id', post.id)
    .select();

  console.log('\n업데이트 결과:');
  console.log('Error:', error);
  console.log('Data:', data);

  // 다시 조회
  const { data: check } = await supabase
    .from('blog_posts')
    .select('content')
    .eq('id', post.id)
    .single();

  console.log('\n재조회 (처음 100자):', check.content.substring(0, 100));
}

testUpdate();
