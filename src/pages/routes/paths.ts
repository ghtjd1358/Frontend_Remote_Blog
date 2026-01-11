/**
 * Route Paths - KOMCA 패턴
 * 라우트 경로 상수 정의
 */

export const RoutePath = {
    Home: '/',
    Blog: '/blog',
    PostDetail: '/post/:slug',
    Write: '/write',
    Edit: '/edit/:slug',
} as const;
