import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

const SUPABASE_URL = 'https://ujhlgylnauzluttvmcrz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwMDQyNywiZXhwIjoyMDgxMDc2NDI3fQ.CJl-dEEPsWuNCjFpAObUUiD69zy-d43ePmCIFV32VlU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

marked.setOptions({ gfm: true, breaks: true });

async function fixPost() {
  // 해당 포스트 찾기
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, title, content')
    .eq('title', '번들러 사이즈 최적화')
    .single();

  if (!post) {
    console.log('포스트를 찾을 수 없습니다.');
    return;
  }

  console.log('원본 (처음 200자):', post.content.substring(0, 200));

  // <p> 태그 제거 후 마크다운 변환
  let cleanContent = post.content;
  // 불필요한 <p> 태그 제거
  cleanContent = cleanContent.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');

  // 마크다운 → HTML 변환
  const htmlContent = marked.parse(cleanContent);

  console.log('\n변환 후 (처음 200자):', htmlContent.substring(0, 200));

  // 업데이트
  const { error } = await supabase
    .from('blog_posts')
    .update({ content: htmlContent })
    .eq('id', post.id);

  if (error) {
    console.log('업데이트 실패:', error);
  } else {
    console.log('\n업데이트 완료!');
  }
}

fixPost();
