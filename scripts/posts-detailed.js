const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujhlgylnauzluttvmcrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwMDQyNywiZXhwIjoyMDgxMDc2NDI3fQ.CJl-dEEPsWuNCjFpAObUUiD69zy-d43ePmCIFV32VlU'
);

const userId = '9878b01c-1d9e-4b54-8323-f77735445b39';

const posts = [
  {
    title: '모놀리식의 한계를 넘어서 - 왜 마이크로 프론트엔드를 선택했는가',
    slug: 'mfa-why-micro-frontend-' + Date.now(),
    excerpt: '모놀리식 구조에서 MFA로 전환하면서 겪은 고민과 기술 선택 과정을 정리했다.',
    content: `이 글은 마이크로 프론트엔드(MFA) 시리즈의 첫 번째 글이다. 왜 모놀리식에서 MFA로 전환했는지, 어떤 기술을 선택했는지, 그 과정에서 무엇을 배웠는지 정리하려고 한다.

## MFA 전환 개요

개인 포트폴리오 프로젝트를 6개월간 모놀리식으로 운영하다가 여러 문제점을 느꼈고, 회사에서 KOMCA 프로젝트를 MFA로 진행하면서 그 장점을 체감한 후 전환을 결심했다.

## 결과

| 항목 | 모놀리식 | MFA | 개선율 |
|------|---------|-----|--------|
| 전체 빌드 시간 | 7분 15초 | 45초 (단일 앱) | 90% 감소 |
| 초기 번들 크기 | 850KB | 180KB | 78% 감소 |
| node_modules | 800MB | 200MB (앱당) | 75% 감소 |

---

## 1. 모놀리식의 문제점

### 1-1. 프로젝트 구조

처음 시작했을 때의 구조는 다음과 같았다.

\`\`\`
portfolio-app/
├── src/
│   ├── pages/
│   │   ├── resume/      # 이력서 페이지들
│   │   ├── blog/        # 블로그 페이지들
│   │   └── portfolio/   # 포트폴리오 페이지들
│   ├── components/
│   └── styles/
├── package.json
└── webpack.config.js
\`\`\`

하나의 앱에서 이력서, 블로그, 포트폴리오 세 기능을 모두 관리하는 구조였다.

### 1-2. 빌드 시간 증가

프로젝트 초기에는 빌드가 45초 정도였는데, 기능이 추가될수록 빌드 시간이 급격히 늘어났다.

\`\`\`bash
# 프로젝트 시작 (2024.01)
npm run build  # 45초

# 3개월 후 (2024.04)
npm run build  # 3분 20초

# 6개월 후 (2024.07)
npm run build  # 7분 15초
\`\`\`

특히 블로그에 TipTap 에디터를 추가하고, 포트폴리오에 애니메이션 라이브러리를 넣으면서 빌드 시간이 급격히 증가했다. 코드 한 줄 수정하고 7분을 기다리는 건 개발 생산성을 심각하게 저하시켰다.

### 1-3. CSS 충돌 문제

\`\`\`css
/* resume/Skills.css */
.card {
  padding: 20px;
  background: #f5f5f5;
}

/* blog/PostCard.css */
.card {
  padding: 16px;
  background: white;
}
\`\`\`

이력서의 스킬 카드 스타일을 수정했는데 블로그의 포스트 카드가 깨지는 일이 발생했다. 클래스명이 충돌하는 문제였다. CSS Modules를 도입하면 해결되지만, 이미 작성된 코드를 전부 수정해야 했다.

### 1-4. 의존성 지옥

\`\`\`json
{
  "dependencies": {
    "@tiptap/react": "^2.0.0",
    "@tiptap/starter-kit": "^2.0.0",
    "@tiptap/extension-link": "^2.0.0",
    "@tiptap/extension-image": "^2.0.0",
    "three": "^0.150.0",
    "framer-motion": "^10.0.0",
    "highlight.js": "^11.0.0",
    // ... 60개 이상의 의존성
  }
}
\`\`\`

이력서만 수정하고 싶은데 TipTap, Three.js 등 블로그와 포트폴리오의 의존성까지 전부 설치해야 했다. node_modules가 800MB를 넘어가면서 설치 시간도 문제가 되었다.

---

## 2. KOMCA 프로젝트 경험

### 2-1. 실무에서의 MFA

회사에서 KOMCA(한국음악저작권협회) 프로젝트를 6개월간 진행했다. Admin, User, Container 세 앱을 마이크로 프론트엔드로 구성한 프로젝트였다.

\`\`\`
komca/
├── container/     # Host 앱 (메인 컨테이너)
├── admin/         # Remote 앱 (관리자)
├── user/          # Remote 앱 (사용자)
└── lib/           # 공통 라이브러리
\`\`\`

처음에는 "왜 이렇게 복잡하게 구성하지?"라고 생각했다. 설정 파일도 많고, 프로젝트 구조도 복잡했기 때문이다.

### 2-2. 3개월 후 깨달음

하지만 3개월쯤 지나니까 MFA의 장점을 체감하기 시작했다.

1. **독립적인 개발**: Admin 팀과 User 팀이 서로 영향 없이 개발
2. **빠른 빌드**: Admin만 수정하면 Admin만 빌드 (30초)
3. **독립 배포**: Admin에 버그가 생겨도 User는 정상 동작

특히 Admin에서 심각한 버그가 발생했을 때, Admin만 롤백하고 User는 그대로 유지할 수 있었던 경험이 인상적이었다. 모놀리식이었다면 전체를 롤백해야 했을 것이다.

---

## 3. 기술 선택

### 3-1. MFA 구현 방식 비교

마이크로 프론트엔드를 구현하는 방법은 여러 가지가 있다.

| 방식 | 장점 | 단점 |
|------|------|------|
| iframe | 완벽한 격리 | 성능 저하, 통신 복잡, SEO 불리 |
| Single-SPA | 프레임워크 무관 | 설정 복잡, 러닝커브 높음 |
| Module Federation | Webpack 내장, 런타임 공유 | Webpack 5 필수 |

### 3-2. Module Federation 선택 이유

1. **이미 검증됨**: KOMCA 프로젝트에서 6개월간 사용
2. **Webpack 5 내장**: 별도 라이브러리 설치 불필요
3. **런타임 코드 공유**: React 등 공통 의존성 중복 로드 방지
4. **충분한 레퍼런스**: 커뮤니티에서 많이 사용

React만 사용할 예정이었기 때문에 Single-SPA의 "프레임워크 무관" 장점이 필요 없었고, iframe은 성능과 UX 측면에서 적합하지 않았다.

---

## 4. 아키텍처 설계

### 4-1. 최종 구조

\`\`\`
mfa/
├── host/           # Container (Port 3000)
├── remote1/        # Resume 이력서 (Port 3001)
├── remote2/        # Blog 블로그 (Port 3002)
├── remote3/        # Portfolio 포트폴리오 (Port 3003)
└── lib/            # 공통 라이브러리 (NPM 배포)
\`\`\`

### 4-2. Hub-Spoke 구조

\`\`\`
         ┌─────────┐
         │ Remote1 │
         │ (이력서) │
         └────┬────┘
              │
┌─────────┐   │   ┌─────────┐
│  Host   │───┼───│ Remote2 │
│(컨테이너)│   │   │ (블로그) │
└─────────┘   │   └─────────┘
              │
         ┌────┴────┐
         │ Remote3 │
         │(포트폴리오)│
         └─────────┘
\`\`\`

모든 Remote가 Host를 통해서만 통신하는 Hub-Spoke 구조를 선택했다. Remote들이 서로 직접 통신하는 P2P 구조도 고려했지만, 의존성이 복잡해지고 순환 참조 위험이 있어서 포기했다.

### 4-3. 공통 라이브러리

Remote 간에 공유해야 하는 코드는 별도의 NPM 패키지로 분리했다.

\`\`\`bash
npm install @sonhoseong/mfa-lib
\`\`\`

공통 컴포넌트, 유틸리티, 타입 정의 등을 이 라이브러리에서 관리한다.

---

## 5. 성능 비교

### 5-1. 빌드 시간

\`\`\`
[ 모놀리식 ]
전체 빌드: 7분 15초

[ MFA ]
Host: 25초
Remote1 (이력서): 20초
Remote2 (블로그): 45초 (TipTap 때문에 무거움)
Remote3 (포트폴리오): 30초

블로그만 수정 시: 45초 (기존 대비 90% 감소)
\`\`\`

### 5-2. 번들 크기

\`\`\`
[ 모놀리식 ]
main.js: 850KB (gzipped)
모든 기능이 하나의 번들에 포함

[ MFA ]
Host: 180KB
Remote1: 45KB
Remote2: 120KB
Remote3: 80KB

초기 로드 (Host만): 180KB (기존 대비 78% 감소)
필요한 Remote만 추가 로드
\`\`\`

---

## 6. 결론

### 6-1. MFA를 선택해야 하는 경우

- 여러 팀이 독립적으로 개발해야 할 때
- 기능별 개발/배포 사이클이 다를 때
- 기능 간 결합도가 낮을 때
- 점진적 마이그레이션이 필요할 때

### 6-2. MFA를 피해야 하는 경우

- 혼자 개발하는 작은 프로젝트 (오버엔지니어링)
- 빠른 MVP가 필요할 때
- 기능 간 결합도가 높을 때

### 6-3. 느낀 점

솔직히 개인 포트폴리오에 MFA는 오버엔지니어링이다. 혼자 개발하는 프로젝트에 Host, Remote1, Remote2, Remote3, lib... 5개 프로젝트를 만들다니.

하지만 학습 목적으로는 최고의 선택이었다고 생각한다. 실무에서 배운 것을 내 프로젝트에 적용하면서 더 깊이 이해할 수 있었고, 포트폴리오에 "MFA 구축 경험"을 어필할 수 있게 되었다.

다음 글에서는 MFA에서 가장 힘들었던 라우팅 문제에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: '새로고침하면 왜 흰화면이야?! - MFA 라우팅 삽질 2주의 기록',
    slug: 'mfa-routing-white-screen-' + Date.now(),
    excerpt: 'MFA에서 새로고침하면 흰화면이 뜨는 문제를 해결하기까지 2주간의 삽질 과정을 정리했다.',
    content: `이 글은 MFA 시리즈의 두 번째 글이다. MFA 개발 중 가장 고통스러웠던 라우팅 문제, 특히 "새로고침하면 흰화면"이 뜨는 문제를 해결하는 과정을 정리했다.

## 라우팅 문제 개요

Host에서 Remote 앱으로 이동한 후 새로고침하면 흰화면이 나타나는 문제가 발생했다. 클릭으로 이동하면 정상 동작하는데, F5를 누르면 아무것도 안 보이는 현상이었다.

## 결과

| 항목 | 문제 상황 | 해결 후 |
|------|----------|---------|
| 새로고침 | 흰화면 | 정상 표시 |
| 직접 URL 접근 | 404 또는 흰화면 | 정상 표시 |
| 해결 시간 | - | 2주 |

---

## 1. 문제 상황

### 1-1. 정상 동작 케이스

\`\`\`
1. Host 접속 (http://localhost:3000)
2. 블로그 메뉴 클릭 (/blog)
3. 글 상세 클릭 (/blog/post/hello-world)
→ 모두 정상 동작!
\`\`\`

### 1-2. 비정상 케이스

\`\`\`
4. F5 (새로고침)
→ 흰화면 😱
\`\`\`

더 혼란스러웠던 건 로컬에서는 잘 되는데 프로덕션(Vercel)에서만 문제가 발생한다는 점이었다.

### 1-3. 콘솔 에러

\`\`\`
Uncaught Error: No routes matched location "/post/hello-world"
\`\`\`

"/blog/post/hello-world"가 아니라 "/post/hello-world"라고 표시되는 게 이상했다. 왜 /blog가 사라졌을까?

---

## 2. 원인 분석

### 2-1. 1주차: 잘못된 가설들

처음에는 여러 가설을 세우고 검증했지만 전부 틀렸다.

**가설 1: Vercel 설정 문제**
→ SPA 라우팅 설정(rewrites) 확인했지만 정상. 기각.

**가설 2: remoteEntry.js 로딩 실패**
→ 네트워크 탭 확인, 모든 파일 200 OK. 기각.

**가설 3: React Router 버전 충돌**
→ Host와 Remote 버전 통일해도 여전히 문제. 기각.

이렇게 1주일을 날렸다.

### 2-2. 디버깅 로그 추가

결국 기본으로 돌아가서 console.log를 추가했다.

\`\`\`tsx
// Remote2 App.tsx
function App() {
  const location = useLocation();

  useEffect(() => {
    console.log("[Remote2] 현재 경로:", location.pathname);
  }, [location.pathname]);

  // ...
}
\`\`\`

새로고침 후 콘솔을 확인했다.

\`\`\`
[Remote2] 현재 경로: /post/hello-world
\`\`\`

"/blog/post/hello-world"가 아니라 "/post/hello-world"로 찍혔다. 여기서 실마리가 잡혔다.

### 2-3. Host 라우팅 방식 이해

Host의 라우트 설정을 다시 살펴봤다.

\`\`\`tsx
// Host의 라우트
<Route path="/blog/*" element={<BlogApp />} />
\`\`\`

\`/blog/*\`의 의미를 정확히 이해하지 못하고 있었다. React Router에서 \`/*\`는 "나머지 경로를 하위 라우터에 전달"한다는 의미였다.

\`\`\`
브라우저 URL: /blog/post/hello-world
Host가 매칭: /blog/*
Remote가 받는 경로: /post/hello-world (★ /blog가 제거됨)
\`\`\`

Host가 "/blog" 부분을 "먹고" 나머지만 Remote에게 전달하는 구조였다.

### 2-4. Remote의 잘못된 라우트

기존 Remote의 라우트는 이랬다.

\`\`\`tsx
// Remote2의 라우트
<Route path="/blog/post/:slug" element={<PostDetail />} />
\`\`\`

Remote가 받는 경로: \`/post/hello-world\`
Remote의 라우트: \`/blog/post/:slug\`

매칭이 안 된다. 그래서 흰화면이었다.

### 2-5. 왜 클릭 이동은 됐을까?

클라이언트 사이드 라우팅:
1. 이미 Remote가 로드되어 있음
2. Link 클릭 → URL 변경 (History API)
3. Remote 내부에서 라우트 처리
4. **Host를 거치지 않음**

새로고침:
1. 브라우저가 서버에 요청
2. Host가 다시 로드
3. Host가 "/blog/*" 매칭 → Remote 로드
4. **Remote가 "/post/hello-world"를 받음**

클릭 이동과 새로고침의 동작 방식이 완전히 다르다는 걸 몰랐다.

---

## 3. 해결책 탐색

### 3-1. 시도 1: 환경변수로 분기

\`\`\`tsx
const PREFIX = process.env.NODE_ENV === "production" ? "" : "/blog";
\`\`\`

문제: 로컬에서 Host 통합 실행하면 production이 아닌데도 Host를 통해 접근한다. 구분이 안 된다.

### 3-2. 시도 2: URL 기반 감지

\`\`\`tsx
const isInHost = window.location.origin.includes("host");
\`\`\`

문제: 프로덕션에서 Host와 Remote 모두 vercel.app 도메인이라 구분이 안 된다.

### 3-3. 최종 해결책: sessionStorage 플래그

문제를 다시 정의했다.

> "Remote가 Host 통합으로 실행 중인지, 단독으로 실행 중인지 어떻게 아는가?"

Host가 직접 알려주면 된다!

\`\`\`typescript
// lib/src/utils/storage.ts
export const storage = {
  setHostApp: () => {
    sessionStorage.setItem("mfa:host-app", "true");
  },

  isHostApp: (): boolean => {
    return sessionStorage.getItem("mfa:host-app") === "true";
  },
};
\`\`\`

\`\`\`tsx
// Host의 bootstrap.tsx
import { storage } from '@sonhoseong/mfa-lib';

storage.setHostApp();  // "나 Host야!" 표시

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
\`\`\`

\`\`\`tsx
// Remote2의 라우트
import { storage } from '@sonhoseong/mfa-lib';

const PREFIX = storage.isHostApp() ? "" : "/blog";

<Routes>
  <Route path={\`\${PREFIX}/\`} element={<PostList />} />
  <Route path={\`\${PREFIX}/post/:slug\`} element={<PostDetail />} />
</Routes>
\`\`\`

Host 통합 실행 시: PREFIX = "" → "/post/:slug"
단독 실행 시: PREFIX = "/blog" → "/blog/post/:slug"

드디어 해결됐다!

---

## 4. 추가 작업

### 4-1. 모든 Link에 PREFIX 적용

라우트만 바꾸면 끝이 아니었다. Link 컴포넌트의 to 속성도 수정해야 했다.

\`\`\`tsx
// ❌ 잘못된 방식
<Link to="/blog/post/hello-world">글 보기</Link>

// ✅ 올바른 방식
<Link to={\`\${PREFIX}/post/hello-world\`}>글 보기</Link>
\`\`\`

### 4-2. PREFIX 계산 타이밍 주의

처음에는 constants.ts에서 PREFIX를 계산했다.

\`\`\`typescript
// constants.ts
export const PREFIX = storage.isHostApp() ? "" : "/blog";
\`\`\`

문제가 생겼다. 모듈 로드 시점에 한 번만 평가되기 때문이다.

\`\`\`
1. Host 로드
2. Remote 모듈 로드 (이때 constants.ts 평가)
3. 아직 setHostApp() 호출 전!
4. isHostApp() = false → PREFIX = "/blog"
5. 이후 setHostApp() 호출해도 PREFIX는 이미 "/blog"로 고정
\`\`\`

해결: 각 파일에서 직접 계산하거나, 함수로 만들어서 호출 시점에 평가되도록 수정했다.

\`\`\`typescript
// 함수로 변경
export const getPrefix = () => storage.isHostApp() ? "" : "/blog";
\`\`\`

---

## 5. 배운 것들

### 5-1. 기술적 교훈

1. **SPA 라우팅은 "눈속임"이다**: URL은 바뀌지만 실제로 받는 건 항상 index.html
2. **새로고침 = 처음부터 다시**: 서버에 다시 요청하기 때문에 전체 플로우가 재실행됨
3. **"로컬에서 됨" ≠ "프로덕션에서 됨"**: 환경 차이를 항상 고려해야 함
4. **타이밍 이슈는 명시적 순서 보장으로 해결**: 모듈 로드 순서에 의존하지 말 것

### 5-2. 디버깅 교훈

1. **가설 세우기 전에 현상 정확히 파악**: "왜 안 되는지" 추측만 하지 말고 "정확히 뭐가 안 되는지" 먼저 파악
2. **기본 도구(console.log)를 무시하지 말 것**: 복잡한 디버깅 도구보다 나을 때가 있음
3. **문제를 정확히 정의하면 해결책이 보임**: "Host인지 어떻게 알지?"로 문제를 재정의하니까 답이 나왔음

### 5-3. 삽질의 가치

2주 동안 삽질했다. 힘들었다.

그런데 돌아보면, 이 2주가 가장 많이 배운 시간이었다.

- SPA 라우팅의 본질을 이해함
- Module Federation의 동작 방식을 이해함
- 디버깅 접근법을 배움

삽질 없이 얻은 지식은 금방 잊는다. 삽질하면서 얻은 지식은 오래 간다.

다음 글에서는 MFA 인증 체계 구축에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
];

(async () => {
  console.log('상세 포스트 삽입 시작...\n');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...post,
        status: 'published',
        is_featured: true,
        is_pinned: false,
        user_id: userId,
      })
      .select('id, title');

    if (error) {
      console.log(`❌ ${i + 1}. 에러: ${error.message}`);
    } else {
      console.log(`✅ ${i + 1}. ${data[0].title}`);
    }
  }

  console.log('\n완료!');
})();
