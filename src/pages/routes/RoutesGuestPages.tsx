import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoginPage } from '@sonhoseong/mfa-lib';
import { RoutePath } from './paths';

const BlogList = lazy(() => import('@/pages/blog/BlogList'));
const PostDetail = lazy(() => import('@/pages/post/detail/PostDetail'));
const SeriesDetail = lazy(() => import('@/pages/series/SeriesDetail'));

function RoutesGuestPages() {
    return (
        <Routes>
            {/* 로그인 */}
            <Route
                path={RoutePath.Login}
                element={
                    <LoginPage
                        appName="Blog"
                        redirectPath={RoutePath.Blog}
                        showTestAccount={true}
                    />
                }
            />

            {/* 메인 */}
            <Route path="/" element={<BlogList />} />
            <Route path={RoutePath.Blog} element={<BlogList />} />

            {/* 상세 페이지 */}
            <Route path={RoutePath.PostDetail} element={<PostDetail />} />

            {/* 시리즈 상세 */}
            <Route path={RoutePath.SeriesDetail} element={<SeriesDetail />} />

            {/* 기타 */}
            <Route path="*" element={<BlogList />} />
        </Routes>
    );
}

export { RoutesGuestPages };
