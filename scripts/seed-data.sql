-- 블로그 시드 데이터 (UTF-8)
-- Supabase SQL Editor에서 실행하세요

-- 기존 데이터 삭제
DELETE FROM blog_posts;
DELETE FROM blog_series;
DELETE FROM blog_categories;

-- 카테고리 데이터
INSERT INTO blog_categories (id, user_id, name, slug, description, color, icon, order_index) VALUES
  ('cccc1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '개발', 'development', '개발 관련 글', '#3B82F6', '💻', 1),
  ('cccc1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '회고', 'retrospect', '회고 및 생각 정리', '#10B981', '📝', 2),
  ('cccc1111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '일상', 'daily', '일상 이야기', '#F59E0B', '☕', 3);

-- 시리즈 데이터
INSERT INTO blog_series (id, user_id, title, slug, description, status, order_index) VALUES
  ('ssss1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'React 마스터하기', 'react-master', 'React의 기초부터 고급 기능까지 다루는 시리즈', 'ongoing', 1),
  ('ssss1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'TypeScript 완벽 가이드', 'typescript-guide', 'TypeScript를 실무에서 활용하는 방법', 'ongoing', 2);

-- 게시글 데이터
INSERT INTO blog_posts (id, user_id, category_id, title, slug, excerpt, content, status, view_count, like_count, is_featured, is_pinned, published_at) VALUES
  (
    'eeee1111-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'cccc1111-0000-0000-0000-000000000001',
    'React 18의 새로운 기능 살펴보기',
    'react-18-new-features',
    'React 18에서 추가된 Concurrent Features와 Suspense 개선사항을 알아봅니다.',
    '<h2>React 18 소개</h2><p>React 18은 Concurrent Rendering을 정식으로 도입한 메이저 버전입니다.</p><h3>주요 기능</h3><ul><li>Automatic Batching</li><li>Transitions</li><li>Suspense 개선</li><li>새로운 Hooks</li></ul><p>이 글에서는 각 기능에 대해 자세히 알아보겠습니다.</p>',
    'published',
    150,
    12,
    true,
    false,
    NOW() - INTERVAL '2 days'
  ),
  (
    'eeee1111-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'cccc1111-0000-0000-0000-000000000001',
    'TypeScript 5.0 마이그레이션 가이드',
    'typescript-5-migration',
    'TypeScript 5.0으로 업그레이드하는 방법과 새로운 기능을 소개합니다.',
    '<h2>TypeScript 5.0</h2><p>TypeScript 5.0에서는 많은 개선사항이 있었습니다.</p><h3>주요 변경점</h3><ul><li>Decorators 표준화</li><li>const Type Parameters</li><li>satisfies 연산자 개선</li></ul><p>마이그레이션 시 주의사항을 알아봅니다.</p>',
    'published',
    89,
    8,
    false,
    false,
    NOW() - INTERVAL '5 days'
  ),
  (
    'eeee1111-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'cccc1111-0000-0000-0000-000000000002',
    '2024년 상반기 회고',
    '2024-first-half-retrospect',
    '2024년 상반기 동안의 개발 여정을 돌아봅니다.',
    '<h2>2024년 상반기를 돌아보며</h2><p>어느덧 2024년 상반기가 지나갔습니다.</p><h3>이룬 것들</h3><ul><li>새로운 프로젝트 런칭</li><li>기술 스택 확장</li><li>팀 협업 개선</li></ul><h3>아쉬운 점</h3><p>블로그 글을 더 자주 쓰지 못한 점이 아쉽습니다.</p>',
    'published',
    67,
    15,
    false,
    true,
    NOW() - INTERVAL '1 day'
  ),
  (
    'eeee1111-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'cccc1111-0000-0000-0000-000000000001',
    'Next.js App Router 완벽 가이드',
    'nextjs-app-router-guide',
    'Next.js 13부터 도입된 App Router의 모든 것을 알아봅니다.',
    '<h2>App Router란?</h2><p>Next.js 13에서 도입된 새로운 라우팅 시스템입니다.</p><h3>주요 특징</h3><ul><li>Server Components 기본 지원</li><li>중첩 레이아웃</li><li>스트리밍 SSR</li><li>데이터 페칭 개선</li></ul>',
    'published',
    234,
    28,
    true,
    false,
    NOW() - INTERVAL '3 days'
  ),
  (
    'eeee1111-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'cccc1111-0000-0000-0000-000000000003',
    '개발자의 하루 루틴',
    'developer-daily-routine',
    '효율적인 개발을 위한 나만의 하루 루틴을 공유합니다.',
    '<h2>나의 하루 루틴</h2><p>꾸준한 성장을 위해 매일 지키는 루틴이 있습니다.</p><h3>아침</h3><p>6시 기상, 30분 운동, 기술 아티클 읽기</p><h3>오후</h3><p>집중 코딩 시간, 코드 리뷰</p><h3>저녁</h3><p>사이드 프로젝트, TIL 작성</p>',
    'published',
    112,
    19,
    false,
    false,
    NOW() - INTERVAL '7 days'
  );