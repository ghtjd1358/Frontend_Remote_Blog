export const RoutePath = {
    // 메인
    Blog: '/blog',
    Login: '/login',
    Dashboard: '/dashboard',

    // 블로그
    PostDetail: '/blog/post/:slug',
    Write: '/blog/write',
    Edit: '/blog/edit/:slug',
    SeriesDetail: '/blog/series/:slug',
    Manage: '/blog/manage',
    My: '/blog/my',
    UserProfile: '/blog/user/:userId',

    // 권한
    AdminAuthMenu: '/admin/auth/menu',
    AdminAuthRoleManagement: '/admin/auth/role-management',
    AdminAuthRoleManagementDetail: '/admin/auth/role-management/:id',
    AdminAuthRoleManagementNew: '/admin/auth/role-management/new',
    AdminAuthUser: '/admin/auth/user',
} as const;
