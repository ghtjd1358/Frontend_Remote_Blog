/**
 * Axios Factory - KOMCA 패턴
 * 401 에러시 자동 토큰 갱신 포함
 */

import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuid } from 'uuid';

export type RequestConfig = Omit<AxiosRequestConfig, 'headers'> & {
  headers: Record<string, string>;
  _isRetry?: boolean;
};

export type Response<ResData> = AxiosResponse<ResData>;

export interface AxiosConfig extends AxiosRequestConfig {
  hostUrl?: string;
  basePath?: string;
}

// API 에러 상세 코드
export type ErrorDetailCodeType = 'TYPE_MISMATCH' | 'NotBlank' | 'NotNull' | 'Pattern' | 'Min' | 'Max' | 'Size';

// 에러 상세 정보
export interface ErrorDetail {
  code: ErrorDetailCodeType;
  field?: string;
  message?: string;
}

// API 에러 응답
export interface ApiErrorResponse {
  code: string;
  statusCode: number;
  timestamp: string;
  errorDetails?: ErrorDetail[];
}

export interface ExtendedAxiosError extends AxiosError {
  response?: AxiosResponse<ApiErrorResponse>;
}

// API 에러 여부 확인
export function isApiError(error: any): error is ExtendedAxiosError {
  return (
    isAxiosError(error) &&
    error.response?.data?.code !== undefined &&
    error.response?.data?.statusCode !== undefined
  );
}

// 에러 상세 정보 확인
export function hasErrorDetails(error: any): ErrorDetail[] | undefined {
  if (isApiError(error) && error.response?.data?.errorDetails?.length) {
    return error.response.data.errorDetails;
  }
  return undefined;
}

// Axios 에러 여부 확인
export function isAxiosError(error: any): error is AxiosError {
  return Boolean((error as AxiosError).isAxiosError);
}

// 서비스 설정
export interface ServiceConfig {
  hostUrl: string;
  basePath?: string;
  timeout?: number;
}

// 토큰 갱신 함수 타입
export type RefreshTokenFn = () => Promise<string | null>;

// 에러 이벤트 디스패치 함수 타입
export type DispatchErrorFn = (errorDetails: ErrorDetail[]) => void;

// Factory 설정
export interface FactoryConfig {
  getAccessToken: () => string;
  setAccessToken: (token: string) => void;
  refreshToken?: RefreshTokenFn;
  onError?: DispatchErrorFn;
  onUnauthorized?: () => void;
}

let factoryConfig: FactoryConfig | null = null;

// Factory 초기화
export function initAxiosFactory(config: FactoryConfig) {
  factoryConfig = config;
}

/**
 * Axios Client Factory
 */
export class AxiosClientFactory {
  /**
   * 기본 요청 핸들러
   */
  private static defaultRequestHandler = async (config: RequestConfig): Promise<RequestConfig> => {
    return config;
  };

  /**
   * Axios 클라이언트 생성
   */
  static createClient(
    serviceConfig: AxiosConfig,
    customRequestHandler?: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig
  ): AxiosInstance {
    const axiosInstance = Axios.create({
      baseURL: `${serviceConfig.hostUrl || ''}${serviceConfig.basePath || ''}`,
      timeout: serviceConfig.timeout || 60000,
      ...serviceConfig,
    });

    // 요청 인터셉터
    axiosInstance.interceptors.request.use((config) => {
      config.headers = config.headers || {};

      // Access Token 추가
      if (factoryConfig) {
        const token = factoryConfig.getAccessToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // UUID 추가 (요청 추적용)
      config.headers['X-Request-ID'] = uuid();

      // 빈 값 필터링
      if (config.params) {
        config.params = Object.entries(config.params).reduce((acc, [key, value]) => {
          if (value !== '' && value != null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
      }

      // 커스텀 요청 핸들러 실행
      if (customRequestHandler) {
        return customRequestHandler(config as RequestConfig);
      }

      return this.defaultRequestHandler(config as RequestConfig);
    });

    // 응답 인터셉터
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 네트워크 에러
        if (error.message === 'Network Error') {
          console.error('[Network Error] 네트워크 연결을 확인해주세요.');
        }

        // 401 에러 - 토큰 갱신 시도
        if (error.response?.status === 401 && factoryConfig?.refreshToken) {
          const originalRequest = error.config;

          if (!originalRequest._isRetry) {
            originalRequest._isRetry = true;

            try {
              // refresh 엔드포인트가 아닌 경우에만 갱신 시도
              if (!originalRequest.url?.includes('/auth/refresh')) {
                const newToken = await factoryConfig.refreshToken();

                if (newToken) {
                  factoryConfig.setAccessToken(newToken);
                  originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                  console.log('[Token Refresh] 토큰이 갱신되었습니다.');
                  return axiosInstance(originalRequest);
                }
              }
            } catch (refreshError) {
              console.error('[Token Refresh Failed]', refreshError);
              factoryConfig.setAccessToken('');
              factoryConfig.onUnauthorized?.();
            }
          }
        }

        // API 에러 처리
        if (isApiError(error)) {
          const errorDetails = hasErrorDetails(error);
          if (errorDetails && factoryConfig?.onError) {
            factoryConfig.onError(errorDetails);
          }
        }

        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }
}