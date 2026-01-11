/**
 * RoutesAuthPages - KOMCA 패턴
 * 로그인 사용자용 라우트
 */

import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RoutePath } from './paths';

const BlogList = lazy(() => import('../BlogList'));
const PostDetail = lazy(() => import('../PostDetail'));
const PostEditor = lazy(() => import('../PostEditor'));

function RoutesAuthPages() {
    return (
        <Routes>
            <Route path={RoutePath.Home} element={<BlogList />} />
            <Route path={RoutePath.Blog} element={<BlogList />} />
            <Route path={RoutePath.PostDetail} element={<PostDetail />} />
            <Route path={RoutePath.Write} element={<PostEditor />} />
            <Route path={RoutePath.Edit} element={<PostEditor />} />
            <Route path="*" element={<Navigate to={RoutePath.Home} replace />} />
        </Routes>
    );
}

export { RoutesAuthPages };
