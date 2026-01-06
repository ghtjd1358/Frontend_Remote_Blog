/**
 * Service Type 정의 - KOMCA 패턴
 * 각 Remote 앱을 구분하는 타입
 */

// Service Type (숫자형)
export type ServiceType = 'resume' | 'blog' | 'portfolio';

// Service Prefix Type (URL prefix)
export type ServicePrefixType = '@resume' | '@blog' | '@portfolio';

// Service Type → Prefix 매핑
export const serviceTypeToPrefix: Record<ServiceType, ServicePrefixType> = {
  resume: '@resume',
  blog: '@blog',
  portfolio: '@portfolio',
};

// Prefix → Service Type 매핑
export const prefixToServiceType: Record<ServicePrefixType, ServiceType> = {
  '@resume': 'resume',
  '@blog': 'blog',
  '@portfolio': 'portfolio',
};

// Service 메타 정보
export interface ServiceMeta {
  type: ServiceType;
  prefix: ServicePrefixType;
  name: string;
  port: number;
}

// 서비스 목록
export const services: ServiceMeta[] = [
  { type: 'resume', prefix: '@resume', name: '이력서', port: 5001 },
  { type: 'blog', prefix: '@blog', name: '블로그', port: 5002 },
  { type: 'portfolio', prefix: '@portfolio', name: '포트폴리오', port: 5003 },
];

// 경로에서 서비스 타입 추출
export const getServiceFromPath = (pathname: string): ServiceType | null => {
  for (const service of services) {
    if (pathname.startsWith(`/${service.prefix}`) || pathname.startsWith(service.prefix)) {
      return service.type;
    }
  }
  return null;
};