/**
 * RoutesGuestPages - KOMCA 패턴
 * 비로그인 사용자용 라우트
 * Host에서 /blog/* 경로로 매핑됨
 */

import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const BlogList = lazy(() => import('../blog/BlogList'));
const PostDetail = lazy(() => import('../post/detail/PostDetail'));

function RoutesGuestPages() {
    return (
        <Routes>
            {/* /blog → BlogList */}
            <Route path="/" element={<BlogList />} />
            {/* /blog/post/:slug → PostDetail */}
            <Route path="/post/:slug" element={<PostDetail />} />
            {/* catch-all 제거 - Host가 다른 경로 처리 */}
        </Routes>
    );
}

export { RoutesGuestPages };
