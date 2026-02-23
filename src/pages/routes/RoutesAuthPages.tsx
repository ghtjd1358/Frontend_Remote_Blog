import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { storage } from '@sonhoseong/mfa-lib';
import { RoutePath } from './paths';

const BlogList = lazy(() => import('@/pages/blog/BlogList'));
const PostDetail = lazy(() => import('@/pages/post/detail/PostDetail'));
const PostEditor = lazy(() => import('@/pages/post/editor/PostEditor'));
const ManagePage = lazy(() => import('@/pages/admin/ManagePage'));
const MyPage = lazy(() => import('@/pages/mypage/MyPage'));

// KOMCA 패턴: Host에서 실행 시 PREFIX 빈 문자열, 단독 실행 시 /blog
const PREFIX = storage.isHostApp() ? '' : '/blog';

function RoutesAuthPages() {
    return (
        <Routes>
            {/* 메인 */}
            <Route path={`${PREFIX}/`} element={<BlogList />} />
            <Route path={`${PREFIX}${RoutePath.Blog}`} element={<BlogList />} />

            {/* 상세 페이지 */}
            <Route path={`${PREFIX}${RoutePath.PostDetail}`} element={<PostDetail />} />

            {/* 글쓰기/수정 */}
            <Route path={`${PREFIX}${RoutePath.Write}`} element={<PostEditor />} />
            <Route path={`${PREFIX}${RoutePath.Edit}`} element={<PostEditor />} />

            {/* 관리 */}
            <Route path={`${PREFIX}${RoutePath.Manage}`} element={<ManagePage />} />

            {/* 마이페이지 */}
            <Route path={`${PREFIX}${RoutePath.My}`} element={<MyPage />} />
            <Route path={`${PREFIX}${RoutePath.UserProfile}`} element={<MyPage />} />

            {/* 기타 */}
            <Route path="*" element={<BlogList />} />
        </Routes>
    );
}

export { RoutesAuthPages };
