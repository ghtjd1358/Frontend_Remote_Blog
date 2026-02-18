/**
 * Velog 태그/시리즈 → Supabase 매핑 스크립트
 *
 * 이미 이관된 게시글에 태그와 시리즈를 연결합니다.
 *
 * 사용법:
 * 1. SUPABASE_KEY 수정
 * 2. node velog-tags-migrate.js
 */

const { createClient } = require('@supabase/supabase-js');

// ============ 설정 ============
const VELOG_USERNAME = 'ghtjd1358';
const VELOG_API = 'https://velog.io/graphql';
const SUPABASE_URL = 'https://ujhlgylnauzluttvmcrz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDA0MjcsImV4cCI6MjA4MTA3NjQyN30.UcOpbc6QDU-J2s_6eI5vEehvbgSRMCSHIjkFiHb0oRo'; // ← Supabase 대시보드 > Settings > API > anon key
const USER_ID = '9878b01c-1d9e-4b54-8323-f77735445b39';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============ Velog에서 게시글 + 태그 가져오기 ============
async function fetchVelogPosts() {
    const allPosts = [];
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
        const query = `
       query Posts($username: String!, $cursor: ID) {
         posts(username: $username, cursor: $cursor) {
           id
           title
           url_slug
           tags
           series {
             name
           }
         }
       }
     `;

        const res = await fetch(VELOG_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { username: VELOG_USERNAME, cursor } })
        });

        const data = await res.json();
        const posts = data?.data?.posts || [];

        if (posts.length === 0) {
            hasMore = false;
        } else {
            allPosts.push(...posts);
            cursor = posts[posts.length - 1].id;
            console.log(`📄 ${allPosts.length}개 글 가져옴...`);
            await new Promise(r => setTimeout(r, 500));
        }
    }

    return allPosts;
}

// ============ Slug 생성 ============
function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || 'tag';
}

// ============ 메인 ============
async function main() {
    console.log('🚀 벨로그 태그/시리즈 이관 시작...\n');

    // 1. 벨로그에서 데이터 가져오기
    const velogPosts = await fetchVelogPosts();
    console.log(`\n✅ 총 ${velogPosts.length}개 글 발견\n`);

    // 2. 모든 태그 수집
    const allTags = new Set();
    velogPosts.forEach(p => p.tags?.forEach(t => allTags.add(t)));
    console.log(`📌 총 ${allTags.size}개 태그 발견`);
    console.log(`   [${[...allTags].slice(0, 10).join(', ')}${allTags.size > 10 ? '...' : ''}]\n`);

    // 3. 모든 시리즈 수집
    const allSeries = new Set();
    velogPosts.forEach(p => p.series?.name && allSeries.add(p.series.name));
    console.log(`📚 총 ${allSeries.size}개 시리즈 발견`);
    console.log(`   [${[...allSeries].join(', ')}]\n`);

    // 4. blog_tags 테이블에 태그 추가
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 태그 추가 중...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const tagName of allTags) {
        const slug = createSlug(tagName);

        const { error } = await supabase
            .from('blog_tags')
            .upsert(
                { name: tagName, slug, user_id: USER_ID },
                { onConflict: 'slug', ignoreDuplicates: true }
            );

        if (error && !error.message.includes('duplicate')) {
            console.error(`  ❌ "${tagName}" 실패:`, error.message);
        } else {
            console.log(`  ✅ ${tagName}`);
        }
    }

    // 5. blog_series 테이블에 시리즈 추가
    if (allSeries.size > 0) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📚 시리즈 추가 중...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        for (const seriesName of allSeries) {
            const slug = createSlug(seriesName);

            const { error } = await supabase
                .from('blog_series')
                .upsert(
                    { name: seriesName, slug, user_id: USER_ID, description: '' },
                    { onConflict: 'slug', ignoreDuplicates: true }
                );

            if (error && !error.message.includes('duplicate')) {
                console.error(`  ❌ "${seriesName}" 실패:`, error.message);
            } else {
                console.log(`  ✅ ${seriesName}`);
            }
        }
    }

    // 6. DB에서 태그/시리즈 ID 가져오기
    const { data: dbTags } = await supabase.from('blog_tags').select('id, name');
    const tagMap = Object.fromEntries((dbTags || []).map(t => [t.name, t.id]));

    const { data: dbSeries } = await supabase.from('blog_series').select('id, name');
    const seriesMap = Object.fromEntries((dbSeries || []).map(s => [s.name, s.id]));

    // 7. 각 게시글에 태그/시리즈 연결
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 게시글에 태그/시리즈 연결 중...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let successCount = 0;
    let failCount = 0;

    for (const velogPost of velogPosts) {
        // DB에서 해당 게시글 찾기 (slug로 매칭)
        const { data: dbPost } = await supabase
            .from('blog_posts')
            .select('id, title')
            .eq('slug', velogPost.url_slug)
            .single();

        if (!dbPost) {
            console.log(`  ⚠️ DB에서 못 찾음: "${velogPost.title}" (slug: ${velogPost.url_slug})`);
            failCount++;
            continue;
        }

        // 태그 연결
        const linkedTags = [];
        if (velogPost.tags && velogPost.tags.length > 0) {
            for (const tagName of velogPost.tags) {
                const tagId = tagMap[tagName];
                if (!tagId) continue;

                const { error } = await supabase
                    .from('blog_post_tags')
                    .upsert(
                        { post_id: dbPost.id, tag_id: tagId },
                        { onConflict: 'post_id,tag_id', ignoreDuplicates: true }
                    );

                if (!error || error.message.includes('duplicate')) {
                    linkedTags.push(tagName);
                }
            }
        }

        // 시리즈 연결
        if (velogPost.series?.name) {
            const seriesId = seriesMap[velogPost.series.name];
            if (seriesId) {
                // blog_posts에 series_id 필드가 있다면 업데이트
                await supabase
                    .from('blog_posts')
                    .update({ series_id: seriesId })
                    .eq('id', dbPost.id);
            }
        }

        const tagsStr = linkedTags.length > 0 ? `[${linkedTags.join(', ')}]` : '(태그 없음)';
        const seriesStr = velogPost.series?.name ? `📚 ${velogPost.series.name}` : '';
        console.log(`  ✅ "${dbPost.title.slice(0, 30)}..." ${tagsStr} ${seriesStr}`);
        successCount++;

        await new Promise(r => setTimeout(r, 50));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 태그/시리즈 이관 완료!');
    console.log(`   성공: ${successCount}개 / 실패: ${failCount}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
