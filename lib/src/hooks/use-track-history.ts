/**
 * Track History Hook - KOMCA 패턴
 * 라우팅 변경 감지 및 자동 탭(Recent Menu) 관리
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { dispatchToHost, getHostStore } from '../store/store-access';
import { storage } from '../utils/storage';
import { RecentMenu } from '../types';
import { getServiceFromPath, ServiceType } from '../types/service';

// LNB 아이템 타입
export interface LnbItem {
  title: string;
  link: string;
  searchStr?: string;
  children?: LnbItem[];
}

// Hook 옵션
export interface TrackHistoryOptions {
  lnbItems: LnbItem[];
  excludePaths?: string[];  // 추적 제외 경로
  onPageView?: (pathname: string) => void;  // 페이지 조회 콜백
}

/**
 * 경로에서 타이틀 찾기
 */
function findTitleByPath(pathname: string, lnbItems: LnbItem[]): string {
  for (const item of lnbItems) {
    if (pathname.includes(item.link) || item.link.includes(pathname)) {
      return item.title;
    }
    if (item.children) {
      const childTitle = findTitleByPath(pathname, item.children);
      if (childTitle) return childTitle;
    }
  }
  return '';
}

/**
 * Track History Hook
 */
export function useTrackHistory(options: TrackHistoryOptions) {
  const location = useLocation();
  const { lnbItems, excludePaths = [], onPageView } = options;
  const [loaded, setLoaded] = useState(false);
  const isInitRef = useRef(false);
  const prevLocationRef = useRef<{ pathname: string; search: string } | null>(null);

  // 페이지 정보 추가
  const addPageInfo = useCallback((pathname: string, search: string, state?: any) => {
    const store = getHostStore();
    if (!store) return;

    const recentMenuState = store.getState().recentMenu;
    const list = recentMenuState?.list || [];

    // 이미 존재하는 메뉴인지 확인
    const existingIndex = list.findIndex((item: RecentMenu) => item.pathname === pathname);
    const service = getServiceFromPath(pathname);

    if (existingIndex === -1) {
      // 새 메뉴 추가
      const id = uuid();
      const title = findTitleByPath(pathname, lnbItems) || pathname.split('/').pop() || '페이지';

      dispatchToHost({
        type: 'recentMenu/addRecentMenu',
        payload: {
          id,
          pathname,
          search,
          title,
          service,
          data: state,
        },
      });
      dispatchToHost({ type: 'recentMenu/setCurrentMenuId', payload: id });
    } else {
      // 기존 메뉴 활성화
      const existingMenu = list[existingIndex];
      dispatchToHost({ type: 'recentMenu/setCurrentMenuId', payload: existingMenu.id });

      // 검색 파라미터 업데이트
      if (search !== existingMenu.search) {
        dispatchToHost({
          type: 'recentMenu/updateMenuSearch',
          payload: { id: existingMenu.id, search },
        });
      }

      // 데이터 업데이트
      if (state) {
        dispatchToHost({
          type: 'recentMenu/updateMenuData',
          payload: { id: existingMenu.id, data: state },
        });
      }
    }

    // 서비스 타입 업데이트
    if (service) {
      dispatchToHost({ type: 'app/setService', payload: service });
    }
  }, [lnbItems]);

  // 초기화
  useEffect(() => {
    if (isInitRef.current) return;
    isInitRef.current = true;

    // Storage에서 Recent Menu 복구
    const savedList = storage.getRecentMenu();
    if (savedList.length > 0) {
      dispatchToHost({
        type: 'recentMenu/setRecentMenu',
        payload: { list: savedList },
      });
    }

    // 현재 페이지 추가
    const { pathname, search } = window.location;
    if (!excludePaths.some(path => pathname.startsWith(path))) {
      addPageInfo(pathname, search);
    }

    prevLocationRef.current = { pathname, search };
    setLoaded(true);

    console.log('[TrackHistory] 초기화 완료:', pathname);
  }, [addPageInfo, excludePaths]);

  // 라우팅 변경 감지
  useEffect(() => {
    if (!loaded) return;

    const { pathname, search, state } = location;
    const prev = prevLocationRef.current;

    // 같은 페이지면 무시
    if (prev && prev.pathname === pathname && prev.search === search) {
      return;
    }

    // 제외 경로면 무시
    if (excludePaths.some(path => pathname.startsWith(path))) {
      prevLocationRef.current = { pathname, search };
      return;
    }

    // 모달 상태면 무시
    if (state === 'modal') {
      prevLocationRef.current = { pathname, search };
      return;
    }

    addPageInfo(pathname, search, state);
    onPageView?.(pathname);
    prevLocationRef.current = { pathname, search };

    console.log('[TrackHistory] 페이지 변경:', pathname);
  }, [location, loaded, addPageInfo, excludePaths, onPageView]);

  return { loaded };
}

/**
 * Recent Menu 상태 Hook
 */
export function useRecentMenuState<D = any>() {
  const store = getHostStore();
  const state = store?.getState().recentMenu;

  const currentMenu = state?.list?.find(
    (menu: RecentMenu) => menu.id === state?.currentId
  );

  return {
    list: state?.list || [],
    currentId: state?.currentId || '',
    currentMenu,
    data: currentMenu?.data as D | undefined,
    state: currentMenu?.state,
  };
}