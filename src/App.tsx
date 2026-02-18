import React, { Suspense, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectAccessToken, DeferredComponent } from '@sonhoseong/mfa-lib';
import { RoutesGuestPages, RoutesAuthPages } from '@/pages/routes';
import './styles/global.css';

// 라우트 전환 시 로딩 UI
const PageLoadingFallback = () => (
    <DeferredComponent delay={150}>
        <div className="page-loading-skeleton">
            <div className="skeleton skeleton-hero" />
            <div className="skeleton-stats">
                <div className="skeleton skeleton-stat" />
                <div className="skeleton skeleton-stat" />
                <div className="skeleton skeleton-stat" />
                <div className="skeleton skeleton-stat" />
            </div>
            <div className="skeleton-cards">
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
            </div>
        </div>
    </DeferredComponent>
);

function App() {
    const accessToken = useSelector(selectAccessToken);
    const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

    return (
        <Suspense fallback={<PageLoadingFallback />}>
            {!isAuthenticated && <RoutesGuestPages/>}
            {isAuthenticated && <RoutesAuthPages />}
        </Suspense>
    );
}

export default App;
