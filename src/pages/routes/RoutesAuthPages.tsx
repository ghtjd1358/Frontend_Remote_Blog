import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RoutePath } from './paths';

const BlogList = lazy(() => import('@/pages/blog/BlogList'));
const PostDetail = lazy(() => import('@/pages/post/detail/PostDetail'));
const PostEditor = lazy(() => import('@/pages/post/editor/PostEditor'));
const ManagePage = lazy(() => import('@/pages/admin/ManagePage'));
const MyPage = lazy(() => import('@/pages/mypage/MyPage'));

function RoutesAuthPages() {
    return (
        <Routes>
            {/* 메인 */}
            <Route path="/" element={<BlogList />} />
            <Route path={RoutePath.Blog} element={<BlogList />} />

            {/* 상세 페이지 */}
            <Route path={RoutePath.PostDetail} element={<PostDetail />} />

            {/* 글쓰기/수정 */}
            <Route path={RoutePath.Write} element={<PostEditor />} />
            <Route path={RoutePath.Edit} element={<PostEditor />} />

            {/* 관리 */}
            <Route path={RoutePath.Manage} element={<ManagePage />} />

            {/* 마이페이지 */}
            <Route path={RoutePath.My} element={<MyPage />} />
            <Route path={RoutePath.UserProfile} element={<MyPage />} />

            {/* 기타 */}
            <Route path="*" element={<BlogList />} />
        </Routes>
    );
}

export { RoutesAuthPages };
