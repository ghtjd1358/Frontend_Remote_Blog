/**
 * Global Loading Hook - KOMCA 패턴
 * API 호출 시 전역 로딩 표시
 */

import { useCallback } from 'react';
import { getHostStore } from '../store/store-access';

/**
 * Global Loading Title 설정
 */
export function useShowGlobalLoading() {
  return useCallback(<T>(promise: Promise<T>, title?: string): Promise<T> => {
    const store = getHostStore();

    if (store) {
      // 로딩 시작
      store.dispatch({
        type: 'app/setGlobalLoadingTitle',
        payload: title || '처리 중...',
      });
      store.dispatch({
        type: 'app/setLoading',
        payload: true,
      });
    }

    return promise.finally(() => {
      if (store) {
        // 로딩 종료
        store.dispatch({
          type: 'app/setLoading',
          payload: false,
        });
        store.dispatch({
          type: 'app/setGlobalLoadingTitle',
          payload: '',
        });
      }
    });
  }, []);
}

/**
 * Loading 상태 직접 제어
 */
export function useLoadingControl() {
  const showLoading = useCallback((title?: string) => {
    const store = getHostStore();
    if (store) {
      store.dispatch({
        type: 'app/setLoading',
        payload: true,
      });
      if (title) {
        store.dispatch({
          type: 'app/setGlobalLoadingTitle',
          payload: title,
        });
      }
    }
  }, []);

  const hideLoading = useCallback(() => {
    const store = getHostStore();
    if (store) {
      store.dispatch({
        type: 'app/setLoading',
        payload: false,
      });
      store.dispatch({
        type: 'app/setGlobalLoadingTitle',
        payload: '',
      });
    }
  }, []);

  return { showLoading, hideLoading };
}