/**
 * MFA 공통 타입 정의
 */

// Service Types
export * from './service';

// 사용자 타입
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

// App State 타입
export interface AppState {
  accessToken: string;
  user: User | null;
  isLoading: boolean;
  globalLoadingTitle: string;
  service: string;
  selectedGnb: string;
}

// Recent Menu (탭) 타입
export interface RecentMenu {
  id: string;
  pathname: string;
  search: string;
  title: string;
  service?: string;
  state?: any;
  data?: any;
}

// Menu 아이템 타입 (LNB)
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

// Menu State 타입
export interface MenuState {
  menuList: MenuItem[];
}

// Recent Menu State 타입
export interface RecentMenuState {
  list: RecentMenu[];
  currentId: string;
}

// Host Root State 타입
export interface HostRootState {
  app: AppState;
  recentMenu: RecentMenuState;
  [key: string]: any;
}

// Redux Store 타입
export interface HostStore {
  getState: () => HostRootState;
  dispatch: (action: any) => any;
  subscribe: (listener: () => void) => () => void;
  replaceReducer: (reducer: any) => void;
}

// 전역 Window 타입 확장
declare global {
  interface Window {
    __REDUX_STORE__: HostStore;
  }
}