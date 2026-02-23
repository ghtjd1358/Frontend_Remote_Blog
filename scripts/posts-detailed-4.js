const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujhlgylnauzluttvmcrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwMDQyNywiZXhwIjoyMDgxMDc2NDI3fQ.CJl-dEEPsWuNCjFpAObUUiD69zy-d43ePmCIFV32VlU'
);

const userId = '9878b01c-1d9e-4b54-8323-f77735445b39';

const posts = [
  {
    title: 'Remote 메뉴를 Host에서 통합 관리하기 - LNB 시스템 구축',
    slug: 'mfa-lnb-system-' + Date.now(),
    excerpt: 'MFA에서 각 Remote의 메뉴 정보를 Host에서 통합 관리하는 시스템을 구축한 과정을 정리했다.',
    content: `이 글은 MFA 시리즈의 아홉 번째 글이다. 각 Remote가 자신의 메뉴 정보를 노출하고, Host가 이를 수집해서 LNB(Left Navigation Bar)를 렌더링하는 시스템을 구축한 과정을 정리했다.

## LNB 통합 개요

MFA에서 각 Remote는 독립적이다. 하지만 메뉴는 Host에서 통합 관리해야 한다. 문제는 Remote의 메뉴 구조를 Host가 어떻게 아느냐다. Host에 하드코딩하면 Remote 수정할 때마다 Host도 수정해야 한다.

## 결과

| 항목 | 하드코딩 | LNB 시스템 |
|------|---------|-----------|
| 메뉴 추가 시 | Host + Remote 수정 | Remote만 수정 |
| Remote 독립성 | 낮음 | 높음 |
| 에러 격리 | 불가 | 가능 |

---

## 1. 문제 상황

### 1-1. 하드코딩 방식

\`\`\`tsx
// Host의 Sidebar.tsx
const menuItems = [
  { label: '이력서', path: '/resume' },
  { label: '블로그', path: '/blog' },
  { label: '  - 글 목록', path: '/blog' },
  { label: '  - 글 작성', path: '/blog/post/new' },
  { label: '포트폴리오', path: '/portfolio' },
];
\`\`\`

블로그에 새 메뉴를 추가하려면 Host도 수정해야 한다. Remote를 수정하면 Host도 수정? MFA의 의미가 없다.

### 1-2. 원하는 구조

\`\`\`
Remote1 → "나의 메뉴 정보" 노출
Remote2 → "나의 메뉴 정보" 노출
Remote3 → "나의 메뉴 정보" 노출
              ↓
           Host가 수집
              ↓
           LNB 렌더링
\`\`\`

각 Remote가 자신의 메뉴를 관리하고, Host는 그냥 수집해서 보여주기만 하면 된다.

---

## 2. 계약 정의

### 2-1. LnbMenuItem 타입

\`\`\`typescript
// lib/src/types/lnb.ts
export interface LnbMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: LnbMenuItem[];
}

export interface RemoteLnbItems {
  hasPrefixList: LnbMenuItem[];       // 일반 메뉴
  hasPrefixAuthList?: LnbMenuItem[];  // 로그인 필요 메뉴
}
\`\`\`

모든 Remote는 이 형태로 메뉴 정보를 노출한다.

---

## 3. Remote에서 메뉴 노출

### 3-1. Webpack exposes 설정

\`\`\`javascript
// remote2/webpack.common.js
new ModuleFederationPlugin({
  name: 'blog',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
    './LnbItems': './src/exposes/LnbItems',  // 추가!
  },
})
\`\`\`

### 3-2. LnbItems 구현

\`\`\`typescript
// remote2/src/exposes/LnbItems.ts
import { LnbMenuItem } from '@sonhoseong/mfa-lib';

export const pathPrefix = '/blog';

export const lnbItems = {
  hasPrefixList: [
    {
      id: 'blog-list',
      label: '글 목록',
      path: '/',
    },
    {
      id: 'blog-categories',
      label: '카테고리',
      path: '/categories',
    },
  ] as LnbMenuItem[],

  hasPrefixAuthList: [
    {
      id: 'blog-new',
      label: '글 작성',
      path: '/post/new',
    },
  ] as LnbMenuItem[],
};

export default lnbItems;
\`\`\`

### 3-3. hasPrefixList vs hasPrefixAuthList

- **hasPrefixList**: 누구나 볼 수 있는 메뉴
- **hasPrefixAuthList**: 로그인한 사용자만 볼 수 있는 메뉴

---

## 4. Host에서 메뉴 수집

### 4-1. 타입 선언

\`\`\`typescript
// host/src/types/remote.d.ts
import { LnbMenuItem } from '@sonhoseong/mfa-lib';

interface RemoteLnbItems {
  hasPrefixList: LnbMenuItem[];
  hasPrefixAuthList?: LnbMenuItem[];
}

declare module '@blog/LnbItems' {
  export const pathPrefix: string;
  export const lnbItems: RemoteLnbItems;
}

declare module '@resume/LnbItems' {
  export const pathPrefix: string;
  export const lnbItems: RemoteLnbItems;
}
\`\`\`

### 4-2. 동적 로딩

\`\`\`typescript
// host/src/utils/loadRemoteLnb.ts
interface RemoteConfig {
  name: string;
  prefix: string;
  loader: () => Promise<any>;
}

const remoteConfigs: RemoteConfig[] = [
  {
    name: '이력서',
    prefix: '/resume',
    loader: () => import('@resume/LnbItems'),
  },
  {
    name: '블로그',
    prefix: '/blog',
    loader: () => import('@blog/LnbItems'),
  },
  {
    name: '포트폴리오',
    prefix: '/portfolio',
    loader: () => import('@portfolio/LnbItems'),
  },
];

export const loadAllLnbItems = async () => {
  const results = await Promise.allSettled(
    remoteConfigs.map(async (config) => {
      const module = await config.loader();
      return {
        name: config.name,
        prefix: config.prefix,
        items: module.lnbItems,
      };
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
};
\`\`\`

### 4-3. Promise.allSettled 사용 이유

\`\`\`typescript
// Promise.all: 하나라도 실패하면 전체 실패
await Promise.all([...]);

// Promise.allSettled: 실패해도 결과 반환
await Promise.allSettled([...]);
\`\`\`

블로그 서버가 죽어도 이력서 메뉴는 보여야 한다. 격리 원칙!

---

## 5. LNB 컴포넌트

### 5-1. Sidebar 구현

\`\`\`tsx
// host/src/components/Sidebar.tsx
const Sidebar = () => {
  const [menuGroups, setMenuGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthSync(supabase);

  useEffect(() => {
    loadAllLnbItems()
      .then(setMenuGroups)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <SidebarSkeleton />;

  return (
    <nav className="sidebar">
      {menuGroups.map((group) => (
        <MenuSection
          key={group.prefix}
          title={group.name}
          items={group.items.hasPrefixList}
          authItems={user ? group.items.hasPrefixAuthList : undefined}
          prefix={group.prefix}
        />
      ))}
    </nav>
  );
};
\`\`\`

### 5-2. MenuSection 구현

\`\`\`tsx
const MenuSection = ({ title, items, authItems, prefix }) => {
  const location = useLocation();

  const renderItem = (item) => {
    const fullPath = prefix + item.path;
    const isActive = location.pathname.startsWith(fullPath);

    return (
      <Link
        key={item.id}
        to={fullPath}
        className={\`menu-item \${isActive ? 'active' : ''}\`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <div className="menu-section">
      <h3>{title}</h3>
      {items.map(renderItem)}
      {authItems?.map(renderItem)}
    </div>
  );
};
\`\`\`

---

## 6. 배운 것들

### 6-1. 기술적 교훈

1. **Module Federation exposes로 데이터도 노출 가능**
2. **Promise.allSettled로 부분 실패 처리**
3. **타입 선언(d.ts)으로 타입 안전성 확보**

### 6-2. 설계 교훈

> "각자 자기 일만 잘 하면 된다"

- Remote: 내 메뉴 정보 제공
- Host: 메뉴 수집해서 렌더링

서로 내부 구현을 몰라도 된다. 계약만 지키면 된다.

다음 글에서는 Vercel 배포 과정을 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: 'MFA Vercel 배포 삽질기 - CORS부터 캐싱까지',
    slug: 'mfa-vercel-deploy-' + Date.now(),
    excerpt: 'MFA 프로젝트를 Vercel에 배포하면서 겪은 삽질들을 정리했다.',
    content: `이 글은 MFA 시리즈의 열 번째 글이다. MFA 프로젝트를 Vercel에 배포하면서 겪은 문제들과 해결책을 정리했다.

## 배포 개요

로컬에서 잘 되던 게 배포하면 안 되는 경우가 많다. 특히 MFA는 여러 앱이 통신해야 해서 더 복잡하다. CORS, publicPath, SPA 라우팅, 캐싱 등 다양한 이슈를 겪었다.

## 결과

| 문제 | 원인 | 해결책 |
|------|------|--------|
| Remote 로딩 실패 | CORS | 헤더 설정 |
| 청크 404 | publicPath | auto 설정 |
| 새로고침 404 | SPA | rewrites 설정 |

---

## 1. 배포 전략

### 1-1. 각각 독립 배포

\`\`\`
mfa-host.vercel.app      → Host
mfa-resume.vercel.app    → Remote1
mfa-blog.vercel.app      → Remote2
mfa-portfolio.vercel.app → Remote3
\`\`\`

각 앱을 별도의 Vercel 프로젝트로 배포했다. 독립 배포가 MFA의 핵심이다.

### 1-2. Vercel 프로젝트 설정

\`\`\`
프로젝트: mfa-blog
Root Directory: remote2
Build Command: npm run build
Output Directory: dist
\`\`\`

---

## 2. CORS 문제

### 2-1. 증상

\`\`\`
Access to script at 'https://mfa-blog.vercel.app/remoteEntry.js'
from origin 'https://mfa-host.vercel.app' has been blocked by CORS policy
\`\`\`

Host에서 Remote의 remoteEntry.js를 로드할 때 CORS 에러가 발생했다.

### 2-2. 원인

브라우저 보안 정책. 다른 Origin에서 스크립트를 로드하려면 CORS 헤더가 필요하다.

### 2-3. 해결: vercel.json

\`\`\`json
// remote2/vercel.json
{
  "headers": [
    {
      "source": "/remoteEntry.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET" }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
\`\`\`

---

## 3. publicPath 문제

### 3-1. 증상

remoteEntry.js는 로드되는데, 실제 청크 파일이 404.

\`\`\`
GET https://mfa-host.vercel.app/123.js 404
(실제로는 https://mfa-blog.vercel.app/123.js 여야 함)
\`\`\`

### 3-2. 원인

청크 파일의 경로가 Host 기준으로 설정됨.

### 3-3. 해결: publicPath: 'auto'

\`\`\`javascript
// webpack.prod.js
output: {
  publicPath: 'auto',  // Webpack이 알아서 계산
}
\`\`\`

remoteEntry.js가 로드된 위치 기준으로 자동 계산된다.

---

## 4. SPA 라우팅 문제

### 4-1. 증상

새로고침하면 404.

\`\`\`
https://mfa-host.vercel.app/blog/post/hello-world
→ 404 Not Found
\`\`\`

### 4-2. 원인

Vercel이 /blog/post/hello-world 파일을 찾으려고 한다. 그런 파일 없다. SPA는 모든 요청이 index.html로 가야 한다.

### 4-3. 해결: rewrites

\`\`\`json
// host/vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
\`\`\`

모든 경로 요청을 /로 보낸다. React Router가 나머지를 처리한다.

---

## 5. 캐싱 문제

### 5-1. 증상

Remote를 업데이트했는데 Host에서 변경이 안 보인다.

### 5-2. 원인

브라우저가 remoteEntry.js를 캐시한다.

### 5-3. 해결: Cache-Control 헤더

\`\`\`json
{
  "headers": [
    {
      "source": "/remoteEntry.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
\`\`\`

remoteEntry.js는 항상 새로 받아오게 한다.

---

## 6. 환경변수 설정

### 6-1. Host의 Remote URL

\`\`\`javascript
// webpack.prod.js
const REMOTE_URLS = {
  resume: process.env.REMOTE_RESUME_URL,
  blog: process.env.REMOTE_BLOG_URL,
  portfolio: process.env.REMOTE_PORTFOLIO_URL,
};

new ModuleFederationPlugin({
  remotes: {
    resume: \`resume@\${REMOTE_URLS.resume}/remoteEntry.js\`,
    blog: \`blog@\${REMOTE_URLS.blog}/remoteEntry.js\`,
    portfolio: \`portfolio@\${REMOTE_URLS.portfolio}/remoteEntry.js\`,
  },
})
\`\`\`

### 6-2. Vercel 환경변수

\`\`\`
Vercel Dashboard > Settings > Environment Variables

REMOTE_RESUME_URL=https://mfa-resume.vercel.app
REMOTE_BLOG_URL=https://mfa-blog.vercel.app
REMOTE_PORTFOLIO_URL=https://mfa-portfolio.vercel.app
\`\`\`

---

## 7. 최종 vercel.json

\`\`\`json
// Remote용 vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/remoteEntry.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
\`\`\`

---

## 8. 배운 것들

### 8-1. 체크리스트

| 항목 | 설정 |
|------|------|
| CORS | Access-Control-Allow-Origin: * |
| publicPath | auto |
| SPA 라우팅 | rewrites → / |
| 캐싱 | remoteEntry.js는 no-cache |

### 8-2. 교훈

> "로컬에서 됨 ≠ 프로덕션에서 됨"

배포 환경을 항상 고려해야 한다. 특히 MFA는 여러 앱이 통신하기 때문에 더 복잡하다.

다음 글에서는 TypeScript 타입 시스템에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: 'Remote 모듈 타입이 없다? - MFA TypeScript 타입 시스템',
    slug: 'mfa-typescript-' + Date.now(),
    excerpt: 'MFA에서 Remote 모듈의 타입을 관리하는 방법을 정리했다.',
    content: `이 글은 MFA 시리즈의 열한 번째 글이다. TypeScript로 MFA를 개발할 때 Remote 모듈의 타입을 어떻게 관리하는지 정리했다.

## TypeScript 타입 개요

Module Federation은 런타임에 모듈을 로드한다. 하지만 TypeScript는 컴파일 타임에 타입을 체크한다. 이 간극을 메워야 한다.

## 결과

| 항목 | 타입 없음 | 타입 선언 후 |
|------|----------|-------------|
| IDE 자동완성 | 불가 | 가능 |
| 타입 에러 감지 | 런타임 | 컴파일 타임 |
| 안정성 | 낮음 | 높음 |

---

## 1. 문제 상황

### 1-1. 타입 에러

\`\`\`tsx
import BlogApp from '@blog/App';
// Error: Cannot find module '@blog/App' or its corresponding type declarations.
\`\`\`

### 1-2. @ts-ignore의 유혹

\`\`\`tsx
// @ts-ignore
import BlogApp from '@blog/App';
\`\`\`

처음에는 이렇게 해결했다. 하지만 타입 안전성을 포기하는 것이다. 런타임에 에러가 터진다.

---

## 2. 타입 선언 파일

### 2-1. d.ts 파일

\`\`\`typescript
// host/src/types/remote.d.ts
declare module '@blog/App' {
  import { ComponentType } from 'react';
  const App: ComponentType<Record<string, never>>;
  export default App;
}

declare module '@resume/App' {
  import { ComponentType } from 'react';
  const App: ComponentType<Record<string, never>>;
  export default App;
}

declare module '@portfolio/App' {
  import { ComponentType } from 'react';
  const App: ComponentType<Record<string, never>>;
  export default App;
}
\`\`\`

### 2-2. Record<string, never>

\`\`\`typescript
ComponentType<Record<string, never>>
\`\`\`

"이 컴포넌트는 props를 받지 않는다"를 의미한다.

\`\`\`tsx
// ✅ 허용
<BlogApp />

// ❌ 타입 에러
<BlogApp someProp="value" />
\`\`\`

---

## 3. LnbItems 타입 선언

\`\`\`typescript
// host/src/types/remote.d.ts
import { LnbMenuItem } from '@sonhoseong/mfa-lib';

interface RemoteLnbItems {
  hasPrefixList: LnbMenuItem[];
  hasPrefixAuthList?: LnbMenuItem[];
}

declare module '@blog/LnbItems' {
  export const pathPrefix: string;
  export const lnbItems: RemoteLnbItems;
  export default lnbItems;
}

declare module '@resume/LnbItems' {
  export const pathPrefix: string;
  export const lnbItems: RemoteLnbItems;
  export default lnbItems;
}
\`\`\`

---

## 4. tsconfig.json 설정

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // ...
  },
  "include": [
    "src/**/*",
    "src/types/**/*.d.ts"  // 타입 선언 파일 포함
  ]
}
\`\`\`

---

## 5. 공통 타입

### 5-1. lib에서 타입 관리

\`\`\`typescript
// lib/src/types/index.ts
export interface LnbMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: LnbMenuItem[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
\`\`\`

### 5-2. 사용

\`\`\`typescript
import { LnbMenuItem, User, ApiResponse } from '@sonhoseong/mfa-lib';

const menuItems: LnbMenuItem[] = [...];
const user: User = {...};
\`\`\`

---

## 6. 타입 가드

### 6-1. 런타임 타입 체크

\`\`\`typescript
function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'content' in value
  );
}

// 사용
if (isPost(data)) {
  console.log(data.title);  // 타입 안전!
}
\`\`\`

### 6-2. API 응답 검증

\`\`\`typescript
const response = await fetchPost(id);

if (!isPost(response.data)) {
  throw new Error('Invalid post data');
}

// 이제 response.data는 Post 타입
\`\`\`

---

## 7. 삽질 기록

### 7-1. d.ts 파일 인식 안 됨

tsconfig.json의 include에 경로가 누락됐다.

\`\`\`json
// ✅
"include": ["src/**/*", "src/types/*.d.ts"]
\`\`\`

### 7-2. 타입 충돌

lib와 앱에서 같은 이름의 타입을 정의하면 충돌한다.

해결: 공통 타입은 lib에서만 정의하고, 앱에서는 import해서 사용.

---

## 8. 배운 것들

### 8-1. 기술적 교훈

1. **d.ts 파일로 Remote 모듈 타입 선언**
2. **공통 타입은 lib에서 중앙 관리**
3. **타입 가드로 런타임 안전성 확보**
4. **strict 모드 사용 권장**

### 8-2. 교훈

> "타입은 문서다"

타입을 잘 작성하면 코드가 문서가 된다. 주석보다 정확하고, 강제된다.

다음 글에서는 6개월간의 삽질을 총정리하려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: '6개월간의 MFA 삽질 총정리 - 실전에서 겪은 이슈들',
    slug: 'mfa-summary-' + Date.now(),
    excerpt: '6개월간 MFA 프로젝트를 진행하면서 겪은 실전 이슈들을 총정리했다.',
    content: `이 글은 MFA 시리즈의 마지막 글이다. 6개월간 MFA 프로젝트를 진행하면서 겪은 실전 이슈들을 총정리했다.

## 시리즈 요약

| 순서 | 주제 | 핵심 내용 |
|------|------|----------|
| 1 | MFA 선택 이유 | 모놀리식 한계, Module Federation 선택 |
| 2 | 라우팅 | 새로고침 흰화면, sessionStorage 해결 |
| 3 | 인증 | localStorage 공유, onAuthStateChange |
| 4 | 상태관리 | 공유 상태 vs 로컬 상태 분리 |
| 5 | Webpack | Module Federation 설정 |
| 6 | 로딩 | Suspense, 스켈레톤 UI |
| 7 | 에러 | Error Boundary 격리 |
| 8 | 라이브러리 | NPM 패키지 배포 |
| 9 | LNB | Remote 메뉴 통합 |
| 10 | 배포 | Vercel, CORS, publicPath |
| 11 | TypeScript | d.ts 파일, 타입 가드 |

---

## 1. 가장 힘들었던 이슈

### 1-1. 라우팅 (2주)

새로고침하면 흰화면이 뜨는 문제. Host가 prefix를 "먹는다"는 걸 이해하는 데 1주일, sessionStorage 해결책을 찾는 데 1주일.

### 1-2. 버전 관리 (지속적)

lib 버전 업데이트하면 모든 앱에서 업데이트해야 한다. 하나라도 버전이 다르면 문제가 생긴다.

### 1-3. 개발 환경 (3일)

4개 앱을 동시에 켜야 통합 테스트가 된다. concurrently로 해결했지만 여전히 복잡하다.

---

## 2. 핵심 교훈

### 2-1. 기술적 교훈

| 주제 | 교훈 |
|------|------|
| Module Federation | singleton으로 React 중복 방지 |
| 라우팅 | Host가 prefix를 소비함 |
| 인증 | localStorage는 도메인 공유 |
| 에러 | Error Boundary로 격리 |
| 배포 | CORS, publicPath: auto |

### 2-2. 설계 교훈

1. **독립성과 공유의 균형**: 완전한 독립은 없다. 공유가 필요한 건 명시적으로 설계해야 한다.

2. **계약 기반 통합**: Host와 Remote는 계약(인터페이스)으로 통신한다. 서로 내부를 몰라도 된다.

3. **격리 우선**: 하나의 실패가 전체에 영향 주면 안 된다.

---

## 3. MFA를 권하는 경우

### 3-1. 적합한 경우

- 여러 팀이 독립적으로 개발해야 할 때
- 기능별 개발/배포 사이클이 다를 때
- 점진적 마이그레이션이 필요할 때
- 학습 목적

### 3-2. 부적합한 경우

- 혼자 개발하는 작은 프로젝트
- 빠른 MVP가 필요할 때
- 기능 간 결합도가 높을 때

---

## 4. 아키텍처 최종 형태

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    Vercel                           │
├─────────────┬─────────────┬─────────────┬───────────┤
│    Host     │   Remote1   │   Remote2   │  Remote3  │
│ (컨테이너)  │  (이력서)   │  (블로그)   │(포트폴리오)│
├─────────────┴─────────────┴─────────────┴───────────┤
│                 @sonhoseong/mfa-lib                 │
│              (NPM 공통 라이브러리)                  │
├─────────────────────────────────────────────────────┤
│                    Supabase                         │
│              (인증 + 데이터베이스)                  │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## 5. 수치로 보는 결과

| 항목 | 모놀리식 | MFA |
|------|---------|-----|
| 전체 빌드 | 7분 15초 | 45초 (단일 앱) |
| 초기 번들 | 850KB | 180KB |
| 독립 배포 | 불가 | 가능 |
| 에러 격리 | 불가 | 가능 |

---

## 6. 앞으로의 계획

1. **모니터링 강화**: Sentry 연동으로 에러 추적
2. **성능 최적화**: 프리로딩 전략 개선
3. **테스트**: E2E 테스트 추가

---

## 7. 마무리

6개월간 MFA를 삽질하면서 정말 많이 배웠다.

- 라우팅 2주 삽질
- Webpack 설정 3일 삽질
- 배포 1주 삽질
- 타입 문제 지속적 삽질

삽질은 고통스럽지만, 가장 효과적인 학습 방법이다. 삽질 없이 얻은 지식은 금방 잊는다.

이 시리즈가 MFA를 시작하는 누군가에게 도움이 되길 바란다.

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
        is_pinned: i === posts.length - 1,  // 마지막 글 고정
        user_id: userId,
      })
      .select('id, title');

    if (error) {
      console.log(`❌ ${i + 9}. 에러: ${error.message}`);
    } else {
      console.log(`✅ ${i + 9}. ${data[0].title}`);
    }
  }

  console.log('\n완료!');
})();
