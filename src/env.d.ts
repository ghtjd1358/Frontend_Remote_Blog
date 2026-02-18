/**
 * 환경 변수 타입 정의 (Remote2 - Blog 앱)
 *
 * Remote2 앱에서 사용하는 환경 변수의 타입을 정의합니다.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    /** 실행 환경 */
    NODE_ENV: 'development' | 'production' | 'test';

    // ============================================
    // Supabase 설정
    // ============================================
    /** Supabase 프로젝트 URL */
    REACT_APP_SUPABASE_URL?: string;

    /** Supabase Anonymous Key (클라이언트 사이드용) */
    REACT_APP_SUPABASE_ANON_KEY?: string;
  }
}

export {};