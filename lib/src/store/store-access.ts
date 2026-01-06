/**
 * Host Store 접근 유틸리티 - KOMCA 패턴
 * Remote 앱에서 Host의 Redux Store에 접근
 */

import { User, HostStore, HostRootState } from '../types';
import { Reducer } from '@reduxjs/toolkit';

/**
 * Host Store 가져오기
 */
export const getHostStore = (): HostStore | undefined => {
  return window.__REDUX_STORE__;
};

/**
 * Host Store 상태 가져오기
 */
export const getHostState = (): HostRootState | null => {
  try {
    const store = getHostStore();
    if (store) {
      return store.getState();
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * 현재 로그인된 사용자 가져오기
 */
export const getCurrentUser = (): User | null => {
  try {
    const state = getHostState();
    if (state) {
      return state.app?.user || null;
    }
    // Store가 없으면 localStorage에서 직접 가져오기 (fallback)
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * accessToken 가져오기
 */
export const getAccessToken = (): string => {
  try {
    const state = getHostState();
    if (state) {
      return state.app?.accessToken || '';
    }
    // Store가 없으면 localStorage에서 직접 가져오기 (fallback)
    return localStorage.getItem('accessToken') || '';
  } catch {
    return '';
  }
};

/**
 * 인증 여부 확인
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

/**
 * 현재 서비스 가져오기
 */
export const getCurrentService = (): string => {
  try {
    const state = getHostState();
    return state?.app?.service || '';
  } catch {
    return '';
  }
};

/**
 * 로딩 상태 확인
 */
export const isLoading = (): boolean => {
  try {
    const state = getHostState();
    return state?.app?.isLoading || false;
  } catch {
    return false;
  }
};

/**
 * Host Store에 액션 디스패치
 */
export const dispatchToHost = (action: any): void => {
  try {
    const store = getHostStore();
    if (store) {
      store.dispatch(action);
    }
  } catch (error) {
    console.error('Failed to dispatch to host store:', error);
  }
};

/**
 * Host Store 상태 변경 구독
 */
export const subscribeToHost = (listener: () => void): (() => void) => {
  try {
    const store = getHostStore();
    if (store) {
      return store.subscribe(listener);
    }
    return () => {};
  } catch {
    return () => {};
  }
};

/**
 * 동적으로 Reducer 주입 (Remote 앱에서 자체 상태 관리 시 사용)
 * 주의: 이 함수는 Host의 injectReducer를 호출해야 함
 */
export const injectReducerToHost = (key: string, reducer: Reducer): void => {
  // Host의 window에 노출된 injectReducer 함수 호출
  if (typeof (window as any).__INJECT_REDUCER__ === 'function') {
    (window as any).__INJECT_REDUCER__(key, reducer);
  } else {
    console.warn('Host injectReducer not available');
  }
};