/**
 * MFA Navigate Hook - KOMCA 패턴
 * 서비스 인식 네비게이션
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, NavigateOptions } from 'react-router-dom';
import { storage } from '../utils/storage';
import {
  ServiceType,
  ServicePrefixType,
  serviceTypeToPrefix,
  prefixToServiceType,
  getServiceFromPath
} from '../types/service';
import { getHostStore } from '../store/store-access';

export interface MfaNavigateOptions extends NavigateOptions {
  service?: ServiceType;
}

/**
 * MFA Navigate Hook
 * 서비스 prefix를 자동으로 처리하는 네비게이션
 */
export function useMfaNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 서비스 타입
  const currentService = useMemo(() => {
    return getServiceFromPath(location.pathname);
  }, [location.pathname]);

  return useCallback((
    to: string | { pathname?: string; search?: string; hash?: string },
    options?: MfaNavigateOptions
  ) => {
    const isHostApp = storage.isHostApp();

    let pathname: string;
    let search: string | undefined;
    let hash: string | undefined;

    if (typeof to === 'string') {
      pathname = to;
    } else {
      pathname = to.pathname || '';
      search = to.search;
      hash = to.hash;
    }

    // 서비스 prefix 결정
    let targetService = options?.service || currentService;

    // 이미 prefix가 있으면 그대로 사용
    if (pathname.startsWith('/@') || pathname.startsWith('/')) {
      // prefix가 이미 있는 경우
      if (pathname.startsWith('/@')) {
        const prefix = pathname.split('/')[1] as ServicePrefixType;
        if (prefixToServiceType[prefix]) {
          targetService = prefixToServiceType[prefix];
        }
      }
    } else {
      // prefix가 없으면 현재 서비스의 prefix 추가
      if (targetService) {
        const prefix = serviceTypeToPrefix[targetService];
        pathname = `/${prefix}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
      }
    }

    // 네비게이션 실행
    navigate(
      { pathname, search, hash },
      { ...options, service: undefined } as NavigateOptions
    );

    console.log(`[Navigate] ${pathname}${search ? `?${search}` : ''}`);
  }, [navigate, currentService]);
}

/**
 * 현재 위치 정보 Hook
 */
export function useCurrentLocation() {
  const location = useLocation();

  return useMemo(() => ({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    service: getServiceFromPath(location.pathname),
    isHostApp: storage.isHostApp(),
  }), [location]);
}

/**
 * 경로 빌더
 */
export function buildPath(
  pathname: string,
  service?: ServiceType,
  params?: Record<string, string>
): string {
  let path = pathname;

  // 서비스 prefix 추가
  if (service) {
    const prefix = serviceTypeToPrefix[service];
    if (!pathname.startsWith(`/${prefix}`)) {
      path = `/${prefix}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
    }
  }

  // 쿼리 파라미터 추가
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    path += `?${searchParams.toString()}`;
  }

  return path;
}