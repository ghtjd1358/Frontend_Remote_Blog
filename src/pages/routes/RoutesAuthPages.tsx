/**
 * RoutesAuthPages - KOMCA 패턴
 * 로그인 사용자용 라우트
 * Host에서 /blog/* 경로로 매핑됨
 */

import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const BlogList = lazy(() => import('../blog/BlogList'));
const PostDetail = lazy(() => import('../post/detail/PostDetail'));
const PostEditor = lazy(() => import('../post/editor/PostEditor'));

function RoutesAuthPages() {
    return (
        <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/write" element={<PostEditor />} />
            <Route path="/edit/:slug" element={<PostEditor />} />
        </Routes>
    );
}

export { RoutesAuthPages };
