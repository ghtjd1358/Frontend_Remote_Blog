/**
 * Auth Hooks - KOMCA 패턴
 * 로그인, 로그아웃, 토큰 갱신
 */

import { useCallback } from 'react';
import { getHostStore, dispatchToHost } from '../store/store-access';
import { storage } from '../utils/storage';
import { User } from '../types';

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 로그인 함수 타입
export type LoginFn = (request: LoginRequest) => Promise<LoginResponse>;

// 로그아웃 함수 타입
export type LogoutFn = () => Promise<void>;

// 토큰 갱신 함수 타입
export type RefreshFn = () => Promise<string | null>;

/**
 * 로그인 Hook
 */
export function useLogin(loginApi?: LoginFn) {
  return useCallback(async (request: LoginRequest): Promise<LoginResponse | null> => {
    try {
      let response: LoginResponse;

      if (loginApi) {
        // 실제 API 호출
        response = await loginApi(request);
      } else {
        // Mock 로그인 (개발용)
        if (request.username === 'admin@test.com' && request.password === '1234') {
          response = {
            accessToken: `mock-token-${Date.now()}`,
            user: {
              id: '1',
              name: '관리자',
              email: request.username,
              role: 'admin',
            },
          };
        } else {
          throw new Error('아이디/비밀번호를 확인해주세요.');
        }
      }

      // Store에 저장
      dispatchToHost({ type: 'app/setAccessToken', payload: response.accessToken });
      dispatchToHost({ type: 'app/setUser', payload: response.user });

      // Storage에도 저장 (새로고침 대비)
      storage.setAccessToken(response.accessToken);
      storage.setUser(response.user);

      console.log('[Login] 로그인 성공:', response.user.email);
      return response;
    } catch (error) {
      console.error('[Login] 로그인 실패:', error);
      throw error;
    }
  }, [loginApi]);
}

/**
 * 로그아웃 Hook
 */
export function useLogout(logoutApi?: LogoutFn) {
  return useCallback(async (): Promise<void> => {
    try {
      // API 호출 (있는 경우)
      if (logoutApi) {
        await logoutApi();
      }

      // Store 초기화
      dispatchToHost({ type: 'app/setAccessToken', payload: '' });
      dispatchToHost({ type: 'app/setUser', payload: null });
      dispatchToHost({ type: 'recentMenu/resetRecentMenu' });

      // Storage 초기화
      storage.clearAuth();

      console.log('[Logout] 로그아웃 완료');
    } catch (error) {
      console.error('[Logout] 로그아웃 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      storage.clearAuth();
      throw error;
    }
  }, [logoutApi]);
}

/**
 * 토큰 갱신 Hook
 */
export function useTokenRefresh(refreshApi?: RefreshFn) {
  return useCallback(async (): Promise<string | null> => {
    try {
      if (!refreshApi) {
        console.warn('[Token Refresh] refresh API가 설정되지 않았습니다.');
        return null;
      }

      const newToken = await refreshApi();

      if (newToken) {
        // Store에 저장
        dispatchToHost({ type: 'app/setAccessToken', payload: newToken });
        storage.setAccessToken(newToken);
        console.log('[Token Refresh] 토큰 갱신 성공');
        return newToken;
      }

      return null;
    } catch (error) {
      console.error('[Token Refresh] 토큰 갱신 실패:', error);
      // 갱신 실패시 로그아웃 처리
      dispatchToHost({ type: 'app/setAccessToken', payload: '' });
      storage.setAccessToken('');
      throw error;
    }
  }, [refreshApi]);
}

/**
 * 인증 상태 확인 Hook
 */
export function useAuthState() {
  const store = getHostStore();
  const state = store?.getState();

  return {
    isAuthenticated: !!state?.app?.accessToken,
    user: state?.app?.user || null,
    accessToken: state?.app?.accessToken || '',
  };
}