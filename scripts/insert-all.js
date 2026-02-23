const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujhlgylnauzluttvmcrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwMDQyNywiZXhwIjoyMDgxMDc2NDI3fQ.CJl-dEEPsWuNCjFpAObUUiD69zy-d43ePmCIFV32VlU'
);

const userId = '9878b01c-1d9e-4b54-8323-f77735445b39';

const posts = [
  {
    title: '새로고침하면 왜 흰화면이야?! - MFA 라우팅 2주간의 삽질과 깨달음',
    slug: 'mfa-routing-white-screen-' + Date.now(),
    excerpt: 'MFA 라우팅에서 가장 고통스러웠던 "새로고침 흰화면" 문제. 2주간의 삽질 과정과 해결책.',
    content: `# 새로고침하면 왜 흰화면이야?! - MFA 라우팅 2주간의 삽질과 깨달음

## 서론: 가장 고통스러웠던 문제

MFA 개발 중 가장 힘들었던 부분이 뭐냐고 물으면, 망설임 없이 **라우팅**이라고 답함.

증상은 단순했음:
1. Host에서 블로그 글 상세 페이지 접속 → 정상
2. F5 (새로고침) 누름
3. 흰화면 😱

처음엔 "버그겠지" 하고 가볍게 생각함. 2주 후, 라우터 코드를 밤새 뚫어지게 쳐다보고 있었음.

## 1. 문제 상황 분석

### 정상 동작 vs 비정상 동작

\`\`\`
[ 정상 동작 ]
1. Host 접속 (/)
2. 블로그 메뉴 클릭 (/blog)
3. 글 클릭 (/blog/post/hello-world)
→ 모두 정상!

[ 비정상 동작 ]
4. F5 (새로고침)
→ 흰화면
\`\`\`

### 더 혼란스러웠던 점

**로컬에서는 잘 됨.** 프로덕션(Vercel)에서만 문제.

"로컬에서 되면 프로덕션에서도 되어야 하는 거 아니야?"

이 생각이 1주일을 날림.

## 2. 원인 발견

### Host의 라우팅 방식

Host의 라우트:
\`\`\`tsx
<Route path="/blog/*" element={<BlogApp />} />
\`\`\`

\`/blog/*\`의 의미:
- \`/blog\` 이후의 모든 경로를 매칭
- **나머지 부분**을 하위 라우터에 전달

\`\`\`
브라우저 URL: /blog/post/hello-world
Host가 매칭: /blog
Remote가 받는 경로: /post/hello-world  ← 여기!
\`\`\`

**Host가 \`/blog\`를 "먹고" 나머지만 Remote에게 줌.**

### Remote의 잘못된 라우트

기존 Remote의 라우트:
\`\`\`tsx
<Route path="/blog/post/:slug" element={<PostDetail />} />
\`\`\`

Remote가 받는 경로: \`/post/hello-world\`
Remote의 라우트: \`/blog/post/:slug\`

**매칭 안 됨.** 그래서 흰화면.

## 3. 최종 해결책: sessionStorage 플래그

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
// host/src/bootstrap.tsx
storage.setHostApp();  // "나 Host야!"
\`\`\`

\`\`\`tsx
// remote2/src/routes.tsx
const PREFIX = storage.isHostApp() ? "" : "/blog";

<Route path={\`\${PREFIX}/post/:slug\`} element={<PostDetail />} />
\`\`\`

드디어 해결!

## 4. 배운 것들

### 기술적 교훈

1. **로컬에서 됨 ≠ 프로덕션에서 됨**
2. **SPA 라우팅은 눈속임, 새로고침은 처음부터 다시**
3. **타이밍 이슈는 명시적 순서 보장으로 해결**
4. **하드코딩은 시한폭탄**

### 고찰: 삽질의 가치

2주 동안 삽질했음. 힘들었음.

그런데 돌아보면, **이 2주가 가장 많이 배운 시간**이었음.

**삽질 없이 얻은 지식은 금방 잊음.** 삽질하면서 얻은 지식은 오래 감.

---

*Written by 손호성*`,
  },
  {
    title: 'Host에서 로그인하면 Remote에서도 로그인되어야지! - MFA 인증체계 구축기',
    slug: 'mfa-auth-system-' + Date.now(),
    excerpt: 'MFA 환경에서 Host와 Remote 간 인증 상태를 어떻게 공유했는지. Supabase Auth, localStorage, 세션 동기화까지의 여정.',
    content: `# Host에서 로그인하면 Remote에서도 로그인되어야지! - MFA 인증체계 구축기

## 서론: 당연한 게 당연하지 않았음

"Host에서 로그인했으면 Remote에서도 로그인된 거 아니야?"

MFA 개발 전에는 이게 당연하다고 생각했음.

**아니었음.**

각 앱이 독립적이라는 건, 인증 상태도 독립적이라는 뜻이었음.

## 1. 문제 인식

각 앱은 별도의 Supabase 클라이언트 인스턴스를 갖고 있음.

\`\`\`
Host         → supabase1 인스턴스 → 세션 A
Remote1      → supabase2 인스턴스 → 세션 B
Remote2      → supabase3 인스턴스 → 세션 C
\`\`\`

**인스턴스가 다르면 세션도 다름.**

## 2. 해결: Supabase 세션 공유

### 핵심 발견

Supabase Auth는 기본적으로 **localStorage에 세션을 저장**함.

같은 도메인이면 localStorage 공유됨.

### 공통 라이브러리로 추출

\`\`\`typescript
// lib/src/network/supabase.ts
export const createSupabaseClient = (url: string, key: string) => {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      storageKey: 'mfa-auth-token',  // 통일된 키!
      autoRefreshToken: true,
    },
  });
};
\`\`\`

### 동작 확인

1. Host에서 로그인
2. localStorage에 \`mfa-auth-token\` 저장됨
3. Remote2 진입
4. Supabase 클라이언트가 \`mfa-auth-token\` 읽음
5. **자동으로 인증됨!**

## 3. 인증 상태 동기화

### 해결: Auth State Change 리스너

\`\`\`typescript
export const useAuthSync = (supabase: SupabaseClient) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return user;
};
\`\`\`

## 4. 배운 것들

1. **같은 도메인의 localStorage는 공유됨**
2. **Supabase Auth는 localStorage 기반**
3. **onAuthStateChange로 실시간 동기화 가능**
4. **프론트엔드 가드 ≠ 보안 (RLS 필수)**

---

*Written by 손호성*`,
  },
  {
    title: 'MFA에서 Redux 쓰면 안 된다고? - 마이크로 프론트엔드 상태관리 전략',
    slug: 'mfa-state-management-' + Date.now(),
    excerpt: 'MFA 환경에서 Redux를 쓸 수 있을까? 공유 상태와 로컬 상태를 분리하고, localStorage와 Context를 조합한 상태관리 전략.',
    content: `# MFA에서 Redux 쓰면 안 된다고? - 마이크로 프론트엔드 상태관리 전략

## 서론: 혼란의 시작

MFA 아키텍처를 검색하면 이런 글들이 나옴:

- "마이크로 프론트엔드에서 전역 상태를 쓰면 안 됩니다"
- "각 앱은 독립적인 상태를 가져야 합니다"

**결론부터: 쓸 수 있음. 단, 방법이 다름.**

## 1. 문제 정의

각 앱에 스토어가 있음. **공유가 안 됨.**

\`\`\`
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Host   │  │ Remote1 │  │ Remote2 │
│ Store A │  │ Store B │  │ Store C │
└─────────┘  └─────────┘  └─────────┘
\`\`\`

## 2. 상태 분류

**공유가 필요한 상태:**
- 유저 정보 (인증)
- 테마 설정

**로컬 상태:**
- 블로그 글 목록
- 폼 입력값
- UI 토글 상태

## 3. 구현 전략

### 로컬 상태: Redux Toolkit

각 앱에서 자신만의 스토어 운영.

\`\`\`typescript
// remote2/src/store/index.ts
export const store = configureStore({
  reducer: {
    posts: postReducer,
  },
});
\`\`\`

### 공유 상태: localStorage + Context

\`\`\`typescript
const SharedProvider = ({ children }) => {
  const [state, setState] = useState(getInitialState);

  const updateState = (partial) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <SharedContext.Provider value={{ state, updateState }}>
      {children}
    </SharedContext.Provider>
  );
};
\`\`\`

## 4. 최종 아키텍처

\`\`\`
┌─────────────────────────────────────────────────┐
│                localStorage                     │
│            (공유 상태 저장소)                    │
└─────────────────────────────────────────────────┘
         ↕              ↕              ↕
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Context(공유)│  │ Context(공유)│  │ Context(공유)│
│ Redux(로컬) │  │ Redux(로컬) │  │ Redux(로컬) │
└─────────────┘  └─────────────┘  └─────────────┘
\`\`\`

**핵심: 공유 상태는 Context + localStorage, 로컬 상태는 Redux**

---

*Written by 손호성*`,
  },
  {
    title: '설정 파일만 500줄? - Webpack Module Federation 설정 완전 정복',
    slug: 'mfa-webpack-module-federation-' + Date.now(),
    excerpt: 'Webpack Module Federation 설정의 모든 것. shared, exposes, remotes 설정과 삽질 기록.',
    content: `# 설정 파일만 500줄? - Webpack Module Federation 설정 완전 정복

## 서론: Webpack과의 전쟁

MFA를 시작하면서 가장 두려웠던 건 Webpack 설정이었음.

## 1. 설정 파일 구조

\`\`\`
webpack.common.js  // 공통 설정
webpack.dev.js     // 개발 환경
webpack.prod.js    // 프로덕션 환경
\`\`\`

## 2. Module Federation 설정

### Host 설정

\`\`\`javascript
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    resume: 'resume@http://localhost:3001/remoteEntry.js',
    blog: 'blog@http://localhost:3002/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
\`\`\`

### Remote 설정

\`\`\`javascript
new ModuleFederationPlugin({
  name: 'blog',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
    './LnbItems': './src/exposes/LnbItems',
  },
  shared: {
    react: { singleton: true },
  },
})
\`\`\`

## 3. shared 설정 심화

### 문제: React가 두 번 로드됨

\`\`\`
Warning: Invalid hook call.
You might have more than one copy of React in the same app.
\`\`\`

### 해결: singleton

\`\`\`javascript
shared: {
  react: {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^19.0.0',
  },
}
\`\`\`

## 4. 트러블슈팅

### "Shared module is not available for eager consumption"

**해결:** bootstrap 패턴 적용

\`\`\`typescript
// index.ts
import('./bootstrap');

// bootstrap.tsx
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')!).render(<App />);
\`\`\`

---

*Written by 손호성*`,
  },
  {
    title: '원격 앱 로딩 중... 을 우아하게 - React.lazy와 Suspense 완벽 활용',
    slug: 'mfa-loading-suspense-' + Date.now(),
    excerpt: 'MFA에서 Remote 앱 로딩을 우아하게 처리하는 방법. React.lazy, Suspense, 스켈레톤 UI, 프리로딩까지.',
    content: `# 원격 앱 로딩 중... 을 우아하게 - React.lazy와 Suspense 완벽 활용

## 서론: 로딩은 UX의 핵심

MFA에서 Remote 앱을 로드하는 건 **네트워크 요청**임.

**기다리는 동안 뭘 보여줄 것인가?**

## 1. 문제 상황

로딩 처리 없을 때:
1. 유저가 블로그 메뉴 클릭
2. 네트워크에서 Remote 로드 중...
3. **3초간 아무것도 안 보임**
4. 갑자기 콘텐츠 등장

**유저: "어? 버그인가?"**

## 2. Suspense 기본

\`\`\`tsx
<Suspense fallback={<Loading />}>
  <BlogApp />
</Suspense>
\`\`\`

## 3. 스켈레톤 UI

\`\`\`tsx
export const BlogSkeleton = () => {
  return (
    <div className="blog-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
};
\`\`\`

\`\`\`css
.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  animation: shimmer 1.5s infinite;
}
\`\`\`

## 4. 프리로딩

### 호버 시 프리로드

\`\`\`tsx
const BlogLink = () => {
  const preloadBlog = () => {
    import('blog/App');
  };

  return (
    <Link to="/blog" onMouseEnter={preloadBlog}>
      블로그
    </Link>
  );
};
\`\`\`

유저가 메뉴에 마우스 올리면 미리 로드 시작.
클릭할 때는 이미 로드 완료 → **즉시 표시**

## 5. 배운 것들

1. **React.lazy + Suspense = 선언적 로딩 처리**
2. **스켈레톤 UI가 스피너보다 좋은 UX**
3. **프리로딩으로 체감 속도 향상**

---

*Written by 손호성*`,
  },
  {
    title: 'Remote가 죽으면 Host도 죽는다? - MFA 에러 격리와 복구 전략',
    slug: 'mfa-error-handling-' + Date.now(),
    excerpt: 'MFA에서 하나의 Remote 에러가 전체 앱을 죽이지 않게 하는 방법. Error Boundary, 에러 격리, 복구 전략.',
    content: `# Remote가 죽으면 Host도 죽는다? - MFA 에러 격리와 복구 전략

## 서론: 공포의 흰화면

블로그(Remote2)에서 런타임 에러를 만들었음.

그런데... **Host 전체가 흰화면이 됨.**

이력서도 안 보이고, 포트폴리오도 안 보이고, 전부 죽음.

## 1. 문제 이해

React에서 에러가 발생하면 부모로 전파되어 **전체 앱 크래시**.

**하나의 Remote 에러가 전체 시스템을 죽임.**

## 2. Error Boundary 구현

\`\`\`tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
\`\`\`

## 3. 계층별 Error Boundary

\`\`\`tsx
const App = () => (
  <ErrorBoundary fallback={<AppCrashPage />}>
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/blog/*"
            element={
              <Suspense fallback={<BlogSkeleton />}>
                <ErrorBoundary fallback={<RemoteError name="블로그" />}>
                  <BlogApp />
                </ErrorBoundary>
              </Suspense>
            }
          />
        </Routes>
      </Layout>
    </Router>
  </ErrorBoundary>
);
\`\`\`

## 4. 재시도 기능

\`\`\`tsx
const handleRetry = () => {
  this.setState({ hasError: false, key: prev.key + 1 });
};
\`\`\`

## 5. 배운 것들

1. **Error Boundary = 에러 격리**
2. **계층별로 Error Boundary 배치**
3. **유저에게 항상 피드백 제공**
4. **복구 가능한 에러는 복구 수단 제공**

---

*Written by 손호성*`,
  },
  {
    title: 'NPM에 내 라이브러리를?! - MFA 공통 라이브러리 설계와 배포',
    slug: 'mfa-shared-library-npm-' + Date.now(),
    excerpt: 'MFA 프로젝트에서 공통 라이브러리를 NPM 패키지로 배포하는 과정. Rollup 설정, peerDependencies, 버전 관리까지.',
    content: `# NPM에 내 라이브러리를?! - MFA 공통 라이브러리 설계와 배포

## 서론: 중복 코드의 공포

세 개의 Remote에 똑같은 코드가 있었음.

**버튼 스타일 바꾸려면 세 곳 다 수정.** 지옥이었음.

## 1. 선택: NPM 패키지

\`\`\`bash
npm install @sonhoseong/mfa-lib
\`\`\`

장점: 버전 관리, 쉬운 업데이트, 표준 방식

## 2. 라이브러리 구조

\`\`\`
lib/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── dist/
├── package.json
└── rollup.config.js
\`\`\`

## 3. Rollup 설정

\`\`\`javascript
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'esm' },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
  ],
};
\`\`\`

## 4. peerDependencies

\`\`\`json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
\`\`\`

**peerDependencies = "이 패키지 필요하지만 내가 포함 안 함"**

## 5. NPM 배포

\`\`\`bash
npm login
npm publish --access public
\`\`\`

## 6. 배운 것들

1. **NPM 배포 = 생각보다 쉬움**
2. **Rollup = 라이브러리 번들링 최적**
3. **peerDependencies = 의존성 충돌 방지**

---

*Written by 손호성*`,
  },
  {
    title: '메뉴가 3개인데 관리 포인트도 3개? - MFA LNB 통합 시스템 구축',
    slug: 'mfa-lnb-integration-' + Date.now(),
    excerpt: 'MFA에서 여러 Remote의 메뉴를 Host에서 통합하여 표시하는 방법. Module Federation exposes, 동적 로딩, 에러 격리.',
    content: `# 메뉴가 3개인데 관리 포인트도 3개? - MFA LNB 통합 시스템 구축

## 서론: 메뉴 관리의 고통

**Remote의 메뉴 구조를 Host가 알아야 함.**

이건 MFA의 "독립성" 원칙에 반함.

## 1. 해결 방향

**Remote가 자신의 메뉴 정보를 노출하고, Host가 수집해서 렌더링**

## 2. Remote에서 메뉴 노출

\`\`\`javascript
// webpack.common.js
exposes: {
  './App': './src/App',
  './LnbItems': './src/exposes/LnbItems',
}
\`\`\`

\`\`\`typescript
// remote2/src/exposes/LnbItems.ts
export const lnbItems = {
  hasPrefixList: [
    { id: 'blog-list', label: '글 목록', path: '/' },
    { id: 'blog-categories', label: '카테고리', path: '/categories' },
  ],
  hasPrefixAuthList: [
    { id: 'blog-new', label: '글 작성', path: '/post/new' },
  ],
};
\`\`\`

## 3. Host에서 메뉴 수집

\`\`\`typescript
const loadAllLnbItems = async () => {
  const results = await Promise.allSettled(
    remoteConfigs.map(async (config) => {
      const module = await config.loader();
      return { name: config.name, items: module.lnbItems };
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
};
\`\`\`

## 4. 배운 것들

1. **Module Federation exposes로 데이터도 노출 가능**
2. **Promise.allSettled로 부분 실패 처리**
3. **Remote는 자신의 정보만 관리**
4. **Host는 수집하고 렌더링만**

---

*Written by 손호성*`,
  },
  {
    title: '배포하면 왜 안 돼? - MFA Vercel 배포 삽질기',
    slug: 'mfa-vercel-deployment-' + Date.now(),
    excerpt: 'MFA 프로젝트를 Vercel에 배포하면서 겪은 삽질들. CORS, publicPath, SPA 라우팅, 캐싱 문제와 해결책.',
    content: `# 배포하면 왜 안 돼? - MFA Vercel 배포 삽질기

## 서론: 로컬에선 됐는데...

로컬: 모두 잘 동작
배포 후: 흰화면, CORS 에러, 404... 지옥이었음.

## 1. 각각 독립 배포

\`\`\`
host.vercel.app      → Host
resume.vercel.app    → Remote1
blog.vercel.app      → Remote2
\`\`\`

## 2. CORS 문제

### 해결: Remote에 CORS 헤더 추가

\`\`\`json
// vercel.json
{
  "headers": [
    {
      "source": "/remoteEntry.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
\`\`\`

## 3. publicPath 문제

### 해결: publicPath: 'auto'

\`\`\`javascript
output: {
  publicPath: 'auto',
}
\`\`\`

## 4. SPA 라우팅 문제

### 해결: rewrites 설정

\`\`\`json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
\`\`\`

## 5. 배운 것들

1. **CORS 헤더는 Remote에 설정**
2. **publicPath: auto가 가장 편함**
3. **SPA rewrites 필수**
4. **remoteEntry.js 캐시 주의**

---

*Written by 손호성*`,
  },
  {
    title: 'Remote 모듈 타입이 없다고? - MFA TypeScript 타입 시스템 구축',
    slug: 'mfa-typescript-types-' + Date.now(),
    excerpt: 'MFA에서 Remote 모듈의 타입을 어떻게 관리할 것인가. d.ts 파일, 공통 타입 라이브러리, 타입 가드까지.',
    content: `# Remote 모듈 타입이 없다고? - MFA TypeScript 타입 시스템 구축

## 서론: any의 유혹

\`\`\`tsx
import BlogApp from '@blog/App';
// Error: Cannot find module '@blog/App'
\`\`\`

처음엔 @ts-ignore로 해결했음. **any의 유혹에 빠졌음.**

## 1. 해결: 타입 선언 파일

\`\`\`typescript
// host/src/types/remote.d.ts
declare module '@blog/App' {
  import { ComponentType } from 'react';
  const App: ComponentType<Record<string, never>>;
  export default App;
}
\`\`\`

## 2. 공통 타입 라이브러리

\`\`\`typescript
// lib/src/types/index.ts
export interface LnbMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
\`\`\`

## 3. 타입 가드

\`\`\`typescript
function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value
  );
}
\`\`\`

## 4. 배운 것들

1. **d.ts 파일로 런타임 모듈 타입 선언**
2. **공통 타입은 lib에서 중앙 관리**
3. **타입 가드로 런타임 타입 안전성**
4. **any는 기술 부채**

---

*Written by 손호성*`,
  },
  {
    title: '6개월간의 삽질 총정리 - MFA 실전 이슈와 해결책',
    slug: 'mfa-real-world-issues-' + Date.now(),
    excerpt: 'MFA 프로젝트 6개월간의 삽질을 총정리. 버전 관리, 개발 환경, 테스트, 디버깅, 스타일 충돌 등 실전 이슈와 해결책.',
    content: `# 6개월간의 삽질 총정리 - MFA 실전 이슈와 해결책

## 서론: 이론과 현실의 간극

6개월간 삽질하면서 배운 "진짜" 이슈들을 정리함.

## 1. 버전 관리 지옥

lib 버전 업데이트했는데 Remote들은 옛날 버전.

### 해결책

1. **버전 고정**
2. **모든 앱 동시 업데이트**
3. **하위 호환성 유지**

## 2. 개발 환경 복잡도

개발하려면 4개 앱을 다 켜야 함.

### 해결책

\`\`\`json
{
  "scripts": {
    "dev": "concurrently \\"npm run dev:host\\" \\"npm run dev:remote1\\" \\"npm run dev:remote2\\""
  }
}
\`\`\`

## 3. 스타일 충돌

Remote1의 CSS가 Remote2에 영향.

### 해결책

- CSS Modules
- BEM 네이밍
- CSS-in-JS

## 4. 회고

### 기술적으로 배운 것

1. Module Federation 동작 원리
2. shared 의존성 관리
3. 타입 시스템 구축
4. 에러 격리 패턴
5. 배포 파이프라인

### 마인드셋

1. **복잡도 증가는 대가임**
2. **완벽한 독립은 없음**
3. **이론과 현실은 다름**
4. **삽질 = 학습**

---

*Written by 손호성*`,
  },
];

(async () => {
  console.log('포스트 삽입 시작...');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...post,
        status: 'published',
        is_featured: true,
        is_pinned: i === posts.length - 1, // 마지막 포스트만 pinned
        user_id: userId,
      })
      .select('id, title');

    if (error) {
      console.log(`❌ ${i + 2}. ${post.title.substring(0, 30)}... - 에러: ${error.message}`);
    } else {
      console.log(`✅ ${i + 2}. ${data[0].title.substring(0, 40)}...`);
    }
  }

  console.log('\\n완료!');
})();
