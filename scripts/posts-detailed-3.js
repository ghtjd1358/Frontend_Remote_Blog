const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujhlgylnauzluttvmcrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwMDQyNywiZXhwIjoyMDgxMDc2NDI3fQ.CJl-dEEPsWuNCjFpAObUUiD69zy-d43ePmCIFV32VlU'
);

const userId = '9878b01c-1d9e-4b54-8323-f77735445b39';

const posts = [
  {
    title: 'Webpack Module Federation 설정 삽질기 - 처음부터 끝까지',
    slug: 'mfa-webpack-config-' + Date.now(),
    excerpt: 'Module Federation 설정 과정에서 겪은 삽질과 최종 설정을 정리했다.',
    content: `이 글은 MFA 시리즈의 다섯 번째 글이다. Webpack Module Federation 설정 과정에서 겪은 삽질과 최종 설정을 정리했다.

## Module Federation 설정 개요

Module Federation은 Webpack 5에 내장된 기능으로, 여러 독립적인 빌드가 런타임에 코드를 공유할 수 있게 해준다. 설정이 복잡하다고 알려져 있는데, 한 번 이해하면 크게 어렵지 않다.

## 결과

| 항목 | 설정 전 | 설정 후 |
|------|--------|---------|
| React 중복 로드 | 발생 | 해결 (singleton) |
| 청크 로드 실패 | 발생 | 해결 (publicPath) |
| 타입 에러 | 다수 | 해결 (d.ts) |

---

## 1. 프로젝트 구조

### 1-1. 파일 구조

\`\`\`
mfa/
├── host/
│   ├── src/
│   ├── public/
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   ├── webpack.prod.js
│   └── package.json
├── remote2/
│   ├── src/
│   ├── public/
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   ├── webpack.prod.js
│   └── package.json
└── lib/
    └── package.json
\`\`\`

### 1-2. Webpack 파일 분리 이유

처음에는 하나의 webpack.config.js에 모든 설정을 넣었다.

\`\`\`javascript
// webpack.config.js (400줄...)
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    // 개발 설정 100줄
  } else {
    // 프로덕션 설정 100줄
  }
  // 공통 설정 200줄
};
\`\`\`

유지보수가 너무 힘들어서 분리했다.

\`\`\`
webpack.common.js  // 공통 설정
webpack.dev.js     // 개발 환경 (merge)
webpack.prod.js    // 프로덕션 환경 (merge)
\`\`\`

---

## 2. Host 설정

### 2-1. webpack.common.js

\`\`\`javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: 'auto',  // 중요!
    clean: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\\.(ts|tsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'host',

      remotes: {
        resume: 'resume@http://localhost:3001/remoteEntry.js',
        blog: 'blog@http://localhost:3002/remoteEntry.js',
        portfolio: 'portfolio@http://localhost:3003/remoteEntry.js',
      },

      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: deps['react-router-dom'],
        },
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
\`\`\`

### 2-2. 핵심 설정 설명

**publicPath: 'auto'**

처음에는 이렇게 했다.

\`\`\`javascript
publicPath: 'http://localhost:3000/'
\`\`\`

로컬에서는 잘 되는데 배포하면 박살난다. Vercel 주소는 다르기 때문이다.

\`publicPath: 'auto'\`로 설정하면 Webpack이 현재 호스트 기준으로 경로를 자동 계산한다.

**singleton: true**

React가 두 번 로드되면 hooks 에러가 발생한다.

\`\`\`
Error: Invalid hook call.
You might have more than one copy of React in the same app.
\`\`\`

\`singleton: true\`로 설정하면 전체 앱에서 React를 딱 하나만 로드한다.

---

## 3. Remote 설정

### 3-1. webpack.common.js

\`\`\`javascript
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  // ... 기본 설정

  plugins: [
    new ModuleFederationPlugin({
      name: 'blog',

      filename: 'remoteEntry.js',

      exposes: {
        './App': './src/App',
        './LnbItems': './src/exposes/LnbItems',
      },

      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: deps['react-router-dom'],
        },
      },
    }),
  ],
};
\`\`\`

### 3-2. exposes 설정

\`\`\`javascript
exposes: {
  './App': './src/App',           // 메인 컴포넌트
  './LnbItems': './src/exposes/LnbItems',  // LNB 메뉴 정보
}
\`\`\`

외부에 노출할 모듈을 정의한다. Host에서 이렇게 import한다.

\`\`\`typescript
const BlogApp = React.lazy(() => import('blog/App'));
\`\`\`

---

## 4. Bootstrap 패턴

### 4-1. 문제

이런 에러가 발생했다.

\`\`\`
Uncaught Error: Shared module is not available for eager consumption
\`\`\`

### 4-2. 원인

shared 모듈은 비동기로 로드되는데, 앱이 동기적으로 시작하려고 해서 발생한다.

### 4-3. 해결: Bootstrap 패턴

\`\`\`typescript
// src/index.ts
import('./bootstrap');
\`\`\`

\`\`\`typescript
// src/bootstrap.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
\`\`\`

동적 import로 감싸서 비동기로 시작하게 한다.

---

## 5. 개발 서버 설정

### 5-1. webpack.dev.js

\`\`\`javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    port: 3002,
    hot: true,
    historyApiFallback: true,  // SPA 라우팅 필수!

    headers: {
      'Access-Control-Allow-Origin': '*',  // CORS
    },

    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
});
\`\`\`

### 5-2. historyApiFallback

SPA에서 필수 설정이다.

\`\`\`
/blog/post/hello-world 접속
→ 서버에는 그런 파일 없음
→ 404?

historyApiFallback: true
→ index.html 반환
→ React Router가 처리
→ 정상 동작!
\`\`\`

### 5-3. CORS 헤더

Host(3000)에서 Remote(3002)를 로드하려면 CORS 허용이 필요하다.

---

## 6. 삽질 기록

### 6-1. 삽질 1: requiredVersion 불일치

\`\`\`
Warning: Invalid hook call.
\`\`\`

Host는 react@19.2.3, Remote는 react@19.2.1을 사용하고 있었다. 버전을 완전히 통일해야 한다.

\`\`\`bash
# 모든 앱에서
npm install react@19.2.3 react-dom@19.2.3
\`\`\`

### 6-2. 삽질 2: remoteEntry.js 캐시

Remote를 수정했는데 Host에서 변경이 안 보였다.

원인: 브라우저가 remoteEntry.js를 캐시함.

해결: 개발 중에는 Hard Refresh (Ctrl+Shift+R) 또는 DevTools에서 "Disable cache" 체크.

### 6-3. 삽질 3: 타입 에러

\`\`\`
Cannot find module 'blog/App' or its corresponding type declarations.
\`\`\`

TypeScript가 Remote 모듈의 타입을 모른다. d.ts 파일로 선언해야 한다.

\`\`\`typescript
// host/src/types/remote.d.ts
declare module 'blog/App' {
  import { ComponentType } from 'react';
  const App: ComponentType;
  export default App;
}
\`\`\`

---

## 7. 배운 것들

### 7-1. 핵심 설정 요약

| 설정 | 용도 |
|------|------|
| publicPath: 'auto' | 배포 환경 대응 |
| singleton: true | 중복 로드 방지 |
| historyApiFallback | SPA 라우팅 |
| bootstrap 패턴 | 비동기 로드 처리 |

### 7-2. 교훈

1. **Webpack 설정도 코드다**: 유지보수 가능하게 분리하자
2. **버전 통일은 필수**: shared 의존성은 버전이 같아야 한다
3. **타입 선언 필요**: Remote 모듈은 d.ts로 타입 선언

다음 글에서는 React.lazy와 Suspense를 활용한 로딩 처리에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: 'React.lazy + Suspense로 Remote 로딩 처리하기',
    slug: 'mfa-lazy-suspense-' + Date.now(),
    excerpt: 'MFA에서 Remote 앱을 로딩할 때 React.lazy와 Suspense를 활용하는 방법을 정리했다.',
    content: `이 글은 MFA 시리즈의 여섯 번째 글이다. Remote 앱을 로딩할 때 사용자 경험을 개선하기 위해 React.lazy와 Suspense를 어떻게 활용했는지 정리했다.

## 로딩 처리 개요

MFA에서 Remote 앱을 로드하는 건 네트워크 요청이다. 시간이 걸린다. 그 동안 사용자에게 무엇을 보여줄지가 UX의 핵심이다.

## 결과

| 항목 | 처리 전 | 처리 후 |
|------|--------|---------|
| 로딩 중 화면 | 빈 화면 | 스켈레톤 UI |
| 체감 로딩 시간 | 느림 | 빠름 |
| 에러 발생 시 | 전체 크래시 | 우아한 폴백 |

---

## 1. 문제 상황

### 1-1. 로딩 처리 없을 때

\`\`\`tsx
// Host에서 Remote 로드
const BlogApp = React.lazy(() => import('blog/App'));

// 그냥 렌더링
<Route path="/blog/*" element={<BlogApp />} />
\`\`\`

결과:
1. 사용자가 블로그 메뉴 클릭
2. 네트워크에서 Remote 로드 중...
3. **3초간 빈 화면**
4. 갑자기 콘텐츠 등장

사용자: "어? 클릭이 안 됐나?" → 여러 번 클릭 → 최악의 UX

### 1-2. 문제의 핵심

피드백이 없다. 로딩 중이라는 걸 사용자가 알 수 없다.

---

## 2. Suspense 적용

### 2-1. 기본 사용

\`\`\`tsx
import { Suspense } from 'react';

const BlogApp = React.lazy(() => import('blog/App'));

<Route
  path="/blog/*"
  element={
    <Suspense fallback={<div>로딩 중...</div>}>
      <BlogApp />
    </Suspense>
  }
/>
\`\`\`

이제 로딩 중에 "로딩 중..." 텍스트가 보인다. 하지만 더 나은 UX가 가능하다.

### 2-2. 스켈레톤 UI

\`\`\`tsx
// components/BlogSkeleton.tsx
export const BlogSkeleton = () => {
  return (
    <div className="blog-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title" />
        <div className="skeleton-meta" />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
};
\`\`\`

\`\`\`css
.skeleton-line {
  height: 16px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
\`\`\`

\`\`\`tsx
<Suspense fallback={<BlogSkeleton />}>
  <BlogApp />
</Suspense>
\`\`\`

스켈레톤 UI는 콘텐츠의 구조를 미리 보여준다. 로딩이 더 빠르게 느껴진다.

---

## 3. 페이지별 스켈레톤

### 3-1. 각 Remote에 맞는 스켈레톤

\`\`\`tsx
// Host의 App.tsx
const BlogApp = React.lazy(() => import('blog/App'));
const ResumeApp = React.lazy(() => import('resume/App'));
const PortfolioApp = React.lazy(() => import('portfolio/App'));

<Routes>
  <Route
    path="/blog/*"
    element={
      <Suspense fallback={<BlogSkeleton />}>
        <BlogApp />
      </Suspense>
    }
  />
  <Route
    path="/resume/*"
    element={
      <Suspense fallback={<ResumeSkeleton />}>
        <ResumeApp />
      </Suspense>
    }
  />
  <Route
    path="/portfolio/*"
    element={
      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioApp />
      </Suspense>
    }
  />
</Routes>
\`\`\`

각 페이지의 레이아웃에 맞는 스켈레톤을 보여주면 더 자연스럽다.

---

## 4. 중첩 Suspense

### 4-1. Remote 내부에서도 lazy 로딩

Remote 내부에서도 코드 스플리팅을 할 수 있다.

\`\`\`tsx
// Remote2 내부
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const PostEditor = React.lazy(() => import('./pages/PostEditor'));

<Routes>
  <Route
    path="/post/:slug"
    element={
      <Suspense fallback={<PostSkeleton />}>
        <PostDetail />
      </Suspense>
    }
  />
</Routes>
\`\`\`

### 4-2. 이중 로딩

이제 로딩이 두 단계로 발생한다.

1. Host → Remote2 로딩 (BlogSkeleton)
2. Remote2 → PostDetail 로딩 (PostSkeleton)

사용자 입장에서는 자연스러운 전환이 된다.

---

## 5. 프리로딩

### 5-1. 호버 시 프리로드

사용자가 메뉴에 마우스를 올리면 미리 로드를 시작한다.

\`\`\`tsx
const BlogLink = () => {
  const preloadBlog = () => {
    import('blog/App');  // 미리 로드
  };

  return (
    <Link
      to="/blog"
      onMouseEnter={preloadBlog}
    >
      블로그
    </Link>
  );
};
\`\`\`

클릭할 때는 이미 로드가 완료되어 있어서 즉시 표시된다.

### 5-2. 라우트 진입 전 프리로드

\`\`\`tsx
// 앱 마운트 시 모든 Remote 프리로드
useEffect(() => {
  // 우선순위 낮게 프리로드
  const timer = setTimeout(() => {
    import('blog/App');
    import('resume/App');
    import('portfolio/App');
  }, 2000);

  return () => clearTimeout(timer);
}, []);
\`\`\`

앱이 로드되고 2초 후에 모든 Remote를 백그라운드에서 프리로드한다.

---

## 6. 로딩 상태 최적화

### 6-1. 깜빡임 방지

로딩이 너무 빠르면 스켈레톤이 잠깐 보였다가 사라진다. 오히려 산만하다.

\`\`\`tsx
// 최소 300ms는 스켈레톤 표시
const DelayedContent = ({ children, minDelay = 300 }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), minDelay);
    return () => clearTimeout(timer);
  }, [minDelay]);

  return ready ? children : null;
};
\`\`\`

### 6-2. 지연된 로딩 표시

200ms 이내에 로드되면 로딩 표시를 안 하는 게 나을 수 있다.

\`\`\`tsx
const useDelayedLoading = (isLoading, delay = 200) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setTimeout(() => setShowLoading(true), delay);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return showLoading;
};
\`\`\`

---

## 7. 배운 것들

### 7-1. 기술적 교훈

1. **Suspense는 선언적 로딩 처리**를 가능하게 한다
2. **스켈레톤 UI**가 스피너보다 좋은 UX를 제공한다
3. **프리로딩**으로 체감 속도를 크게 개선할 수 있다
4. **중첩 Suspense**로 세분화된 로딩이 가능하다

### 7-2. UX 교훈

> "로딩은 실패가 아니다. 자연스러운 것이다."

로딩을 숨기려 하지 말고, 우아하게 처리하자.

다음 글에서는 Error Boundary를 활용한 에러 처리에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: 'Remote 하나가 죽으면 전체가 죽는다? - Error Boundary로 에러 격리',
    slug: 'mfa-error-boundary-' + Date.now(),
    excerpt: 'MFA에서 Error Boundary를 활용해 에러를 격리하고 복구하는 방법을 정리했다.',
    content: `이 글은 MFA 시리즈의 일곱 번째 글이다. Remote 하나에서 에러가 발생했을 때 전체 앱이 죽지 않도록 Error Boundary로 에러를 격리하는 방법을 정리했다.

## 에러 격리 개요

MFA의 핵심 가치 중 하나는 "격리"다. 하나의 Remote에 문제가 생겨도 다른 Remote에 영향을 주지 않아야 한다. 하지만 React의 기본 동작은 그렇지 않다.

## 결과

| 항목 | 격리 전 | 격리 후 |
|------|--------|---------|
| Remote 에러 시 | 전체 앱 크래시 | 해당 영역만 에러 표시 |
| 복구 가능성 | 새로고침 필요 | 재시도 버튼 |
| 다른 기능 | 사용 불가 | 정상 사용 가능 |

---

## 1. 문제 상황

### 1-1. 에러 전파

블로그(Remote2)에서 런타임 에러가 발생했다.

\`\`\`typescript
// Remote2의 어딘가
const title = post.data.title;  // post.data가 undefined!
// TypeError: Cannot read properties of undefined
\`\`\`

결과: **전체 앱이 흰화면이 된다.**

이력서도 안 보이고, 포트폴리오도 안 보인다. 블로그 하나 때문에 전부 죽었다.

### 1-2. React의 에러 전파 방식

React에서 에러가 발생하면 부모로 전파되어 최상위까지 올라간다.

\`\`\`
App (크래시!)
 └── Layout (크래시!)
      └── Routes (크래시!)
           └── BlogApp (에러 발생!)
\`\`\`

전체 컴포넌트 트리가 언마운트된다.

---

## 2. Error Boundary

### 2-1. 기본 구현

Error Boundary는 클래스 컴포넌트로만 구현할 수 있다.

\`\`\`tsx
// components/ErrorBoundary.tsx
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
    // 에러 로깅 서비스로 전송
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
\`\`\`

### 2-2. 사용

\`\`\`tsx
<ErrorBoundary fallback={<div>에러가 발생했습니다</div>}>
  <BlogApp />
</ErrorBoundary>
\`\`\`

이제 BlogApp에서 에러가 발생해도 fallback만 표시되고, 다른 부분은 정상 동작한다.

---

## 3. 재시도 기능

### 3-1. 재시도 가능한 Error Boundary

\`\`\`tsx
interface Props {
  children: ReactNode;
  fallback: (retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  errorKey: number;
}

class RetryableErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorKey: 0 };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      errorKey: prev.errorKey + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback(this.handleRetry);
    }

    return (
      <div key={this.state.errorKey}>
        {this.props.children}
      </div>
    );
  }
}
\`\`\`

### 3-2. 사용

\`\`\`tsx
<RetryableErrorBoundary
  fallback={(retry) => (
    <div className="error-container">
      <h2>문제가 발생했습니다</h2>
      <p>블로그를 불러올 수 없습니다.</p>
      <button onClick={retry}>다시 시도</button>
    </div>
  )}
>
  <BlogApp />
</RetryableErrorBoundary>
\`\`\`

사용자가 "다시 시도" 버튼을 클릭하면 컴포넌트가 다시 마운트된다.

---

## 4. 계층별 Error Boundary

### 4-1. 다단계 보호

\`\`\`tsx
// 최상위: 앱 전체 보호
<ErrorBoundary fallback={<AppCrashPage />}>
  <Router>
    <Layout>
      {/* 콘텐츠 영역 보호 */}
      <ErrorBoundary fallback={<ContentError />}>
        <Routes>
          {/* 각 Remote 보호 */}
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
          <Route
            path="/resume/*"
            element={
              <Suspense fallback={<ResumeSkeleton />}>
                <ErrorBoundary fallback={<RemoteError name="이력서" />}>
                  <ResumeApp />
                </ErrorBoundary>
              </Suspense>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Layout>
  </Router>
</ErrorBoundary>
\`\`\`

### 4-2. 에러 수준별 처리

- **Remote 레벨 에러**: 해당 Remote만 에러 표시, 다른 Remote 정상
- **콘텐츠 레벨 에러**: 메인 콘텐츠 영역 에러 표시, 헤더/푸터 정상
- **앱 레벨 에러**: 전체 에러 페이지

---

## 5. 에러 UI 디자인

### 5-1. RemoteError 컴포넌트

\`\`\`tsx
interface RemoteErrorProps {
  name: string;
  onRetry?: () => void;
}

export const RemoteError = ({ name, onRetry }: RemoteErrorProps) => {
  return (
    <div className="remote-error">
      <div className="error-icon">⚠️</div>
      <h2>{name}을(를) 불러올 수 없습니다</h2>
      <p>일시적인 문제가 발생했습니다.</p>
      <div className="error-actions">
        {onRetry && (
          <button onClick={onRetry} className="btn-retry">
            다시 시도
          </button>
        )}
        <button onClick={() => window.location.reload()} className="btn-refresh">
          새로고침
        </button>
      </div>
    </div>
  );
};
\`\`\`

### 5-2. 스타일

\`\`\`css
.remote-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-retry {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
}
\`\`\`

---

## 6. 주의사항

### 6-1. Error Boundary가 못 잡는 에러

- **이벤트 핸들러 내부 에러**
- **비동기 코드 에러** (setTimeout, Promise 등)
- **서버 사이드 렌더링 에러**
- **Error Boundary 자체의 에러**

### 6-2. 이벤트 핸들러 에러 처리

\`\`\`tsx
// Error Boundary가 못 잡음
<button onClick={() => {
  throw new Error('클릭 에러');  // ❌
}}>

// try-catch로 직접 처리
<button onClick={() => {
  try {
    riskyOperation();
  } catch (error) {
    setError(error);  // 상태로 처리
  }
}}>
\`\`\`

### 6-3. 비동기 에러 처리

\`\`\`tsx
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  fetchData()
    .catch((err) => setError(err));
}, []);

// 에러를 던져서 Error Boundary가 잡게 함
if (error) throw error;
\`\`\`

---

## 7. 배운 것들

### 7-1. 기술적 교훈

1. **Error Boundary = 에러 격리**
2. **계층별로 Error Boundary 배치**하면 세분화된 에러 처리 가능
3. **이벤트 핸들러와 비동기 코드**는 별도 처리 필요
4. **재시도 기능**을 제공하면 UX 개선

### 7-2. 아키텍처 교훈

> "시스템은 반드시 실패한다. 중요한 건 실패를 어떻게 처리하느냐다."

에러 처리는 부가 기능이 아니라 핵심 기능이다. MFA에서 격리는 필수다.

다음 글에서는 공통 라이브러리 NPM 배포에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: '공통 라이브러리 NPM 패키지로 배포하기 - @sonhoseong/mfa-lib',
    slug: 'mfa-npm-library-' + Date.now(),
    excerpt: 'MFA 프로젝트의 공통 코드를 NPM 패키지로 배포하는 과정을 정리했다.',
    content: `이 글은 MFA 시리즈의 여덟 번째 글이다. 여러 앱에서 공유하는 코드를 NPM 패키지로 배포하는 과정을 정리했다.

## 공통 라이브러리 개요

MFA 프로젝트에서 Host와 Remote들이 공유하는 코드가 있다. 컴포넌트, 유틸리티, 타입 정의 등이다. 이걸 복붙하면 유지보수가 힘들어진다. NPM 패키지로 분리하면 해결된다.

## 결과

| 항목 | 복붙 방식 | NPM 패키지 |
|------|----------|-----------|
| 코드 중복 | 3곳에 동일 코드 | 1곳에서 관리 |
| 업데이트 | 3곳 모두 수정 | npm update |
| 버전 관리 | 불가능 | 가능 |

---

## 1. 라이브러리 구조

### 1-1. 폴더 구조

\`\`\`
lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Loading/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuthSync.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── dist/
├── package.json
├── tsconfig.json
└── rollup.config.js
\`\`\`

### 1-2. 내보내기 구조

\`\`\`typescript
// src/index.ts
export * from './components';
export * from './hooks';
export * from './utils';
export * from './types';
\`\`\`

\`\`\`typescript
// src/components/index.ts
export { Button } from './Button';
export { Loading } from './Loading';
export { LnbMenu } from './LnbMenu';
\`\`\`

---

## 2. package.json 설정

\`\`\`json
{
  "name": "@sonhoseong/mfa-lib",
  "version": "1.3.8",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/types/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-peer-deps-external": "^2.2.4",
    "typescript": "^5.0.0"
  }
}
\`\`\`

### 2-1. 핵심 필드 설명

| 필드 | 용도 |
|------|------|
| main | CommonJS 진입점 |
| module | ESM 진입점 (번들러용) |
| types | TypeScript 타입 정의 |
| files | NPM에 포함할 파일 |
| peerDependencies | 사용하는 앱에서 제공해야 할 의존성 |

### 2-2. peerDependencies

\`\`\`json
"peerDependencies": {
  "react": "^19.0.0"
}
\`\`\`

"이 패키지는 React가 필요하지만, 내가 직접 포함하지 않는다. 사용하는 앱에서 제공해라."

lib에 React를 직접 포함하면 버전 충돌이 발생할 수 있다. peerDependencies로 선언하면 사용하는 앱의 React를 사용한다.

---

## 3. Rollup 설정

\`\`\`javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
  input: 'src/index.ts',

  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],

  plugins: [
    peerDepsExternal(),  // peer deps 번들에서 제외
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
  ],
};
\`\`\`

### 3-1. 왜 Rollup?

- 라이브러리 번들링에 최적화
- Tree Shaking 지원
- ESM, CJS 동시 출력 용이

Webpack은 앱 번들링에 적합하고, Rollup은 라이브러리 번들링에 적합하다.

---

## 4. TypeScript 설정

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

\`declaration: true\`로 타입 정의 파일(.d.ts)을 자동 생성한다.

---

## 5. NPM 배포

### 5-1. 첫 배포

\`\`\`bash
# NPM 로그인
npm login

# 빌드
npm run build

# 배포 (스코프 패키지는 public으로!)
npm publish --access public
\`\`\`

\`--access public\` 옵션이 중요하다. 스코프 패키지(@xxx/yyy)는 기본이 private이라서 유료 계정이 필요하다. public으로 하면 무료다.

### 5-2. 버전 업데이트

\`\`\`bash
# 패치 버전 (1.3.7 → 1.3.8)
npm version patch

# 마이너 버전 (1.3.8 → 1.4.0)
npm version minor

# 메이저 버전 (1.4.0 → 2.0.0)
npm version major

# 배포
npm publish
\`\`\`

### 5-3. 버전 관리 원칙

| 버전 | 변경 내용 |
|------|----------|
| patch | 버그 수정 (하위 호환) |
| minor | 새 기능 추가 (하위 호환) |
| major | Breaking Change (하위 호환 X) |

---

## 6. 사용하는 쪽

### 6-1. 설치

\`\`\`bash
npm install @sonhoseong/mfa-lib
\`\`\`

### 6-2. 사용

\`\`\`typescript
import {
  Button,
  Loading,
  useAuthSync,
  storage,
  LnbMenuItem
} from '@sonhoseong/mfa-lib';

const App = () => {
  const { user } = useAuthSync(supabase);

  return (
    <div>
      {user ? <span>{user.email}</span> : <Loading />}
      <Button onClick={() => console.log(storage.isHostApp())}>
        클릭
      </Button>
    </div>
  );
};
\`\`\`

### 6-3. 업데이트

\`\`\`bash
# 최신 버전으로
npm update @sonhoseong/mfa-lib

# 특정 버전으로
npm install @sonhoseong/mfa-lib@1.3.8
\`\`\`

---

## 7. 삽질 기록

### 7-1. 타입 파일 경로 오류

\`\`\`
Cannot find module '@sonhoseong/mfa-lib' or its corresponding type declarations.
\`\`\`

package.json의 \`types\` 경로가 틀렸다.

\`\`\`json
// ❌
"types": "dist/index.d.ts"

// ✅
"types": "dist/types/index.d.ts"
\`\`\`

### 7-2. React 중복 에러

lib에 React를 dependencies로 넣었더니 버전 충돌이 발생했다.

\`\`\`
Error: Invalid hook call.
\`\`\`

peerDependencies로 옮겨서 해결했다.

### 7-3. dist 폴더 누락

처음에 dist를 .gitignore에 넣었는데, NPM 배포할 때 빈 패키지가 됐다.

\`\`\`json
// package.json
"files": ["dist"]
\`\`\`

files 필드로 포함할 파일을 명시했다.

---

## 8. 배운 것들

### 8-1. 기술적 교훈

1. **NPM 배포는 생각보다 쉽다**
2. **Rollup은 라이브러리 번들링에 최적**
3. **peerDependencies로 의존성 충돌 방지**
4. **ESM + CJS 동시 지원 필요**

### 8-2. 설계 교훈

> "공통화는 필요한 것만. 과도한 공통화 = 과도한 결합"

모든 걸 라이브러리에 넣으려 하지 말자. 정말 여러 곳에서 쓰는 것만 넣자.

다음 글에서는 LNB 통합 시스템에 대해 다루려고 한다.

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
      console.log(`❌ ${i + 5}. 에러: ${error.message}`);
    } else {
      console.log(`✅ ${i + 5}. ${data[0].title}`);
    }
  }

  console.log('\n완료!');
})();
