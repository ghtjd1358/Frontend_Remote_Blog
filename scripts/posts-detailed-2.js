const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ujhlgylnauzluttvmcrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGxneWxuYXV6bHV0dHZtY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwMDQyNywiZXhwIjoyMDgxMDc2NDI3fQ.CJl-dEEPsWuNCjFpAObUUiD69zy-d43ePmCIFV32VlU'
);

const userId = '9878b01c-1d9e-4b54-8323-f77735445b39';

const posts = [
  {
    title: 'Host에서 로그인했는데 Remote에서 로그아웃? - MFA 인증 상태 공유',
    slug: 'mfa-auth-sharing-' + Date.now(),
    excerpt: 'MFA 환경에서 Host와 Remote 간 인증 상태를 공유하는 방법을 정리했다.',
    content: `이 글은 MFA 시리즈의 세 번째 글이다. Host에서 로그인했는데 Remote에서는 로그아웃 상태로 표시되는 문제를 해결하는 과정을 정리했다.

## 인증 공유 개요

MFA 환경에서는 각 앱이 독립적으로 실행되기 때문에, 인증 상태도 기본적으로 공유되지 않는다. Host에서 로그인해도 Remote에서는 로그인 상태를 모른다는 뜻이다. 이 문제를 어떻게 해결했는지 정리한다.

## 결과

| 항목 | 문제 상황 | 해결 후 |
|------|----------|---------|
| Host 로그인 → Remote | 로그아웃 상태 | 자동 인증 |
| Host 로그아웃 → Remote | 여전히 로그인 | 자동 로그아웃 |
| 실시간 동기화 | 불가능 | 가능 |

---

## 1. 문제 상황

### 1-1. 각 앱의 독립적인 Supabase 인스턴스

처음에는 각 앱에서 Supabase 클라이언트를 별도로 생성했다.

\`\`\`typescript
// Host
const supabase = createClient(url, key);

// Remote1
const supabase = createClient(url, key);

// Remote2
const supabase = createClient(url, key);
\`\`\`

같은 URL과 Key를 사용하지만, **인스턴스가 다르면 세션도 다르다**.

\`\`\`
Host         → supabase 인스턴스 A → 세션 A (로그인됨)
Remote1      → supabase 인스턴스 B → 세션 B (로그아웃)
Remote2      → supabase 인스턴스 C → 세션 C (로그아웃)
\`\`\`

### 1-2. 문제의 핵심

Host에서 로그인하면 Host의 메모리에만 세션이 저장된다. Remote는 Host의 메모리에 접근할 수 없으니 로그인 상태를 알 수 없다.

---

## 2. 해결 방향

### 2-1. Supabase Auth의 저장 방식

Supabase Auth는 기본적으로 **localStorage**에 세션을 저장한다.

\`\`\`javascript
// localStorage 확인
localStorage.getItem('sb-xxx-auth-token')
// {"access_token": "...", "refresh_token": "...", ...}
\`\`\`

localStorage는 **같은 도메인에서 공유**된다. 이 점을 활용하면 된다.

### 2-2. 해결 전략

1. 모든 앱에서 같은 storageKey 사용
2. Supabase 클라이언트 설정 통일
3. 공통 라이브러리로 추출

---

## 3. 구현

### 3-1. 공통 Supabase 클라이언트

\`\`\`typescript
// lib/src/network/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'mfa-auth-token';

export const createSupabaseClient = (
  url: string,
  key: string
): SupabaseClient => {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      storageKey: STORAGE_KEY,  // 통일된 키!
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};
\`\`\`

### 3-2. 각 앱에서 사용

\`\`\`typescript
// Host, Remote1, Remote2, Remote3 모두 동일
import { createSupabaseClient } from '@sonhoseong/mfa-lib';

const supabase = createSupabaseClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
\`\`\`

### 3-3. 동작 확인

\`\`\`
1. Host에서 로그인
2. localStorage에 'mfa-auth-token' 저장됨
3. Remote2 진입
4. Supabase 클라이언트가 'mfa-auth-token' 읽음
5. 자동으로 인증됨!
\`\`\`

---

## 4. 실시간 동기화

### 4-1. 새로운 문제

Host에서 로그아웃하면 Remote에서는 어떻게 될까?

\`\`\`
Host: 로그아웃 실행 → localStorage 클리어
Remote2: 아직 메모리에 이전 세션 유지 → 로그인된 것처럼 보임
\`\`\`

실시간 동기화가 안 된다.

### 4-2. onAuthStateChange 리스너

Supabase의 \`onAuthStateChange\`를 활용하면 해결된다.

\`\`\`typescript
// lib/src/hooks/useAuthSync.ts
import { useEffect, useState } from 'react';
import { User, SupabaseClient } from '@supabase/supabase-js';

export const useAuthSync = (supabase: SupabaseClient) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth]', event, session?.user?.email);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
};
\`\`\`

### 4-3. 컴포넌트에서 사용

\`\`\`tsx
// Remote2의 Header.tsx
const Header = () => {
  const { user, loading } = useAuthSync(supabase);

  if (loading) return <HeaderSkeleton />;

  return (
    <header>
      {user ? (
        <span>{user.email}</span>
      ) : (
        <Link to="/login">로그인</Link>
      )}
    </header>
  );
};
\`\`\`

---

## 5. 권한 관리

### 5-1. 프론트엔드 가드

로그인이 필요한 페이지는 AuthGuard로 보호한다.

\`\`\`tsx
// Remote2의 AuthGuard.tsx
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuthSync(supabase);
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
\`\`\`

\`\`\`tsx
// 라우트에서 사용
<Route
  path="/post/new"
  element={
    <AuthGuard>
      <PostEditor />
    </AuthGuard>
  }
/>
\`\`\`

### 5-2. 백엔드 검증 (Supabase RLS)

프론트엔드 가드만으로는 부족하다. API를 직접 호출하면 뚫린다.

\`\`\`sql
-- Supabase RLS 정책
CREATE POLICY "Users can create own posts"
ON blog_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
ON blog_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON blog_posts
FOR DELETE
USING (auth.uid() = user_id);
\`\`\`

프론트엔드 가드는 UX를 위한 것이고, 실제 보안은 백엔드(RLS)에서 담당한다.

---

## 6. 배운 것들

### 6-1. 기술적 교훈

1. **localStorage는 같은 도메인에서 공유된다**
2. **Supabase Auth는 localStorage 기반이라 공유 가능하다**
3. **onAuthStateChange로 실시간 동기화가 가능하다**
4. **프론트엔드 가드 ≠ 보안** (RLS 필수)

### 6-2. 아키텍처 교훈

MFA에서 "공유"는 명시적으로 설계해야 한다. 각 앱이 독립적이라는 건 장점이지만, 공유가 필요한 것(인증, 테마 등)은 의도적으로 설계해야 한다.

다음 글에서는 MFA 상태관리 전략에 대해 다루려고 한다.

---

*Written by 손호성*`,
  },
  {
    title: 'MFA에서 Redux 어떻게 써? - 공유 상태 vs 로컬 상태 전략',
    slug: 'mfa-state-management-' + Date.now(),
    excerpt: 'MFA 환경에서 Redux를 사용하는 방법과 공유 상태/로컬 상태 분리 전략을 정리했다.',
    content: `이 글은 MFA 시리즈의 네 번째 글이다. "MFA에서 전역 상태를 쓰면 안 된다"는 말을 많이 들었는데, 실제로 어떻게 해야 하는지 정리했다.

## 상태관리 개요

MFA에서는 각 앱이 독립적인 스토어를 갖는다. 하지만 모든 상태가 독립적일 필요는 없다. 어떤 상태는 공유해야 하고, 어떤 상태는 독립적이어야 한다. 이 구분이 핵심이다.

## 결과

| 상태 유형 | 관리 방식 | 예시 |
|----------|----------|------|
| 공유 상태 | Context + localStorage | 유저 정보, 테마 |
| 로컬 상태 | Redux Toolkit | 블로그 글 목록, 폼 |

---

## 1. 문제 정의

### 1-1. MFA에서의 상태관리 이슈

\`\`\`
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Host     │  │   Remote1   │  │   Remote2   │
│   Store A   │  │   Store B   │  │   Store C   │
└─────────────┘  └─────────────┘  └─────────────┘
      ?               ?               ?
\`\`\`

각 앱에 별도의 Redux 스토어가 있다. 기본적으로 공유가 안 된다.

### 1-2. 실제로 겪은 문제

\`\`\`typescript
// Host에서 유저 정보 저장
dispatch(setUser(userData));

// Remote2에서 유저 정보 필요
const user = useSelector((state) => state.user);
// user === undefined 😱
\`\`\`

Host에서 저장한 유저 정보를 Remote에서 가져올 수 없었다.

---

## 2. 상태 분류

### 2-1. 공유가 필요한 상태

- 유저 정보 (인증)
- 테마 설정 (다크모드 등)
- 전역 알림/토스트

이런 상태는 어느 앱에서든 접근해야 한다.

### 2-2. 로컬 상태

- 블로그 글 목록
- 폼 입력값
- 모달 열림/닫힘
- 무한 스크롤 상태

이런 상태는 해당 앱에서만 사용한다.

### 2-3. 분류 기준

> "이 상태가 없으면 다른 앱이 동작 못 하는가?"
>
> - Yes → 공유 상태
> - No → 로컬 상태

대부분의 상태는 로컬이다. 공유 상태는 최소화해야 한다.

---

## 3. 로컬 상태: Redux Toolkit

### 3-1. 각 앱별 스토어

\`\`\`typescript
// remote2/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import postReducer from './slices/postSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    posts: postReducer,
    ui: uiReducer,
  },
  devTools: {
    name: 'Remote2-Blog',  // DevTools에서 구분
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
\`\`\`

### 3-2. Slice 예시

\`\`\`typescript
// remote2/src/store/slices/postSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPosts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPosts: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
\`\`\`

### 3-3. 타입드 훅

\`\`\`typescript
// remote2/src/store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
\`\`\`

---

## 4. 공유 상태: Context + localStorage

### 4-1. SharedContext 구현

\`\`\`typescript
// lib/src/context/SharedContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SharedState {
  user: User | null;
  theme: 'light' | 'dark';
}

const STORAGE_KEY = 'mfa-shared-state';

const getInitialState = (): SharedState => {
  if (typeof window === 'undefined') {
    return { user: null, theme: 'light' };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { user: null, theme: 'light' };
};

const SharedContext = createContext<{
  state: SharedState;
  updateState: (partial: Partial<SharedState>) => void;
} | null>(null);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SharedState>(getInitialState);

  const updateState = (partial: Partial<SharedState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // 다른 탭/앱에서 변경 시 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SharedContext.Provider value={{ state, updateState }}>
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedState = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error('useSharedState must be used within SharedProvider');
  }
  return context;
};
\`\`\`

### 4-2. 사용 예시

\`\`\`tsx
// 어느 앱에서든
import { useSharedState } from '@sonhoseong/mfa-lib';

const Header = () => {
  const { state, updateState } = useSharedState();

  const toggleTheme = () => {
    updateState({ theme: state.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <header className={state.theme}>
      <button onClick={toggleTheme}>
        {state.theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
};
\`\`\`

---

## 5. 최종 아키텍처

\`\`\`
┌─────────────────────────────────────────────────┐
│                localStorage                     │
│            (공유 상태 저장소)                    │
│       mfa-shared-state: { user, theme }         │
└─────────────────────────────────────────────────┘
         ↕              ↕              ↕
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Host     │  │   Remote1   │  │   Remote2   │
│             │  │             │  │             │
│ SharedCtx   │  │ SharedCtx   │  │ SharedCtx   │
│ (공유 상태) │  │ (공유 상태) │  │ (공유 상태) │
│             │  │             │  │             │
│ Redux Store │  │ Redux Store │  │ Redux Store │
│ (로컬 상태) │  │ (로컬 상태) │  │ (로컬 상태) │
└─────────────┘  └─────────────┘  └─────────────┘
\`\`\`

---

## 6. 배운 것들

### 6-1. 기술적 교훈

1. **MFA에서도 Redux 사용 가능** (앱별 스토어로)
2. **공유 상태는 최소화**해야 결합도가 낮아진다
3. **localStorage + storage 이벤트**로 앱 간 동기화 가능
4. **Redux Toolkit**은 보일러플레이트가 거의 없어서 좋다

### 6-2. 설계 교훈

> "이 상태가 공유되어야 하는 이유가 있는가?"

이 질문을 먼저 하자. 공유 상태가 많아지면 MFA의 장점이 사라진다.

다음 글에서는 Webpack Module Federation 설정에 대해 다루려고 한다.

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
      console.log(`❌ ${i + 3}. 에러: ${error.message}`);
    } else {
      console.log(`✅ ${i + 3}. ${data[0].title}`);
    }
  }

  console.log('\n완료!');
})();
