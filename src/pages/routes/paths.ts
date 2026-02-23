export const RoutePath = {
    // 메인 (상대 경로 - PREFIX와 함께 사용)
    Blog: '/',
    Login: '/login',
    Dashboard: '/dashboard',

    // 블로그 (상대 경로)
    PostDetail: '/post/:slug',
    Write: '/write',
    Edit: '/edit/:slug',
    SeriesDetail: '/series/:slug',
    Manage: '/manage',
    My: '/my',
    UserProfile: '/user/:userId',

    // 권한
    AdminAuthMenu: '/admin/auth/menu',
    AdminAuthRoleManagement: '/admin/auth/role-management',
    AdminAuthRoleManagementDetail: '/admin/auth/role-management/:id',
    AdminAuthRoleManagementNew: '/admin/auth/role-management/new',
    AdminAuthUser: '/admin/auth/user',
} as const;
