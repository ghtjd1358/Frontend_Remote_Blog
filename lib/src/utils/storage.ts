/**
 * Storage 유틸리티 - KOMCA 패턴
 * localStorage/sessionStorage 관리
 */

import { User, RecentMenu } from '../types';

// Storage 키 상수
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
  RECENT_MENU: 'recentMenu',
  IS_HOST_APP: 'isHostApp',
};

/**
 * Storage 유틸리티
 */
export const storage = {
  // Host 앱 여부 설정/확인
  setHostApp: () => {
    sessionStorage.setItem(STORAGE_KEYS.IS_HOST_APP, 'true');
  },

  isHostApp: () => {
    return sessionStorage.getItem(STORAGE_KEYS.IS_HOST_APP) === 'true';
  },

  // Access Token
  getAccessToken: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '';
  },

  setAccessToken: (token: string) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  },

  // User 정보
  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Recent Menu (탭 관리)
  getRecentMenu: (): RecentMenu[] => {
    try {
      const menuStr = localStorage.getItem(STORAGE_KEYS.RECENT_MENU);
      return menuStr ? JSON.parse(menuStr) : [];
    } catch {
      return [];
    }
  },

  setRecentMenu: (list: RecentMenu[]) => {
    localStorage.setItem(STORAGE_KEYS.RECENT_MENU, JSON.stringify(list));
  },

  // 인증 정보 전체 삭제
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.RECENT_MENU);
    sessionStorage.removeItem(STORAGE_KEYS.IS_HOST_APP);
  },

  // 전체 삭제
  clearAll: () => {
    localStorage.clear();
    sessionStorage.clear();
  },
};