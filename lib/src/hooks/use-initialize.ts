/**
 * Initialize Hook - KOMCA 패턴
 * 앱 시작시 초기화 (토큰 갱신, 사용자 정보 로드)
 */

import { useEffect, useState } from 'react';
import { getHostStore, dispatchToHost } from '../store/store-access';
import { storage } from '../utils/storage';
import { User } from '../types';

// 초기화 옵션
export interface InitializeOptions {
  // 토큰 갱신 함수
  refreshToken?: () => Promise<string | null>;
  // 사용자 정보 조회 함수
  fetchUserInfo?: () => Promise<User | null>;
  // 초기화 완료 후 콜백
  onInitialized?: () => void;
  // 에러 발생시 콜백
  onError?: (error: Error) => void;
}

/**
 * 앱 초기화 Hook
 */
export function useInitialize(options: InitializeOptions = {}) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // 1. Storage에서 기존 토큰 복구
        const savedToken = storage.getAccessToken();
        const savedUser = storage.getUser();

        if (savedToken) {
          // Store에 복구
          dispatchToHost({ type: 'app/setAccessToken', payload: savedToken });

          if (savedUser) {
            dispatchToHost({ type: 'app/setUser', payload: savedUser });
          }

          // 2. 토큰 갱신 시도 (옵션)
          if (options.refreshToken) {
            try {
              const newToken = await options.refreshToken();
              if (newToken) {
                dispatchToHost({ type: 'app/setAccessToken', payload: newToken });
                storage.setAccessToken(newToken);
                console.log('[Initialize] 토큰 갱신 성공');

                // 3. 사용자 정보 갱신 (옵션)
                if (options.fetchUserInfo) {
                  const userInfo = await options.fetchUserInfo();
                  if (userInfo) {
                    dispatchToHost({ type: 'app/setUser', payload: userInfo });
                    storage.setUser(userInfo);
                    console.log('[Initialize] 사용자 정보 갱신:', userInfo.email);
                  }
                }
              }
            } catch (refreshError) {
              console.warn('[Initialize] 토큰 갱신 실패, 기존 토큰 사용');
            }
          }
        }

        // 4. Recent Menu 복구
        const savedRecentMenu = storage.getRecentMenu();
        if (savedRecentMenu.length > 0) {
          dispatchToHost({
            type: 'recentMenu/setRecentMenu',
            payload: { list: savedRecentMenu },
          });
        }

        setInitialized(true);
        options.onInitialized?.();
        console.log('[Initialize] 앱 초기화 완료');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('초기화 실패');
        setError(error);
        options.onError?.(error);
        console.error('[Initialize] 초기화 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return { initialized, loading, error };
}

/**
 * 간단한 초기화 Hook (토큰/사용자 정보 복구만)
 */
export function useSimpleInitialize() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Storage에서 복구
    const savedToken = storage.getAccessToken();
    const savedUser = storage.getUser();

    if (savedToken) {
      dispatchToHost({ type: 'app/setAccessToken', payload: savedToken });
    }
    if (savedUser) {
      dispatchToHost({ type: 'app/setUser', payload: savedUser });
    }

    // Recent Menu 복구
    const savedRecentMenu = storage.getRecentMenu();
    if (savedRecentMenu.length > 0) {
      dispatchToHost({
        type: 'recentMenu/setRecentMenu',
        payload: { list: savedRecentMenu },
      });
    }

    setInitialized(true);
  }, []);

  return { initialized };
}