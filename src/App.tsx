/**
 * App Component - KOMCA 패턴
 * 인증 상태에 따른 라우트 분기
 */

import React, { Suspense, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RoutesGuestPages, RoutesAuthPages } from './pages/routes';
import './styles/global.css';

function App() {
    const accessToken = useSelector((state: any) => state.app?.accessToken);
    const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

    return (
        <main className="main-content">
            <Suspense fallback="">
                {!isAuthenticated && <RoutesGuestPages />}
                {isAuthenticated && <RoutesAuthPages />}
            </Suspense>
        </main>
    );
}

export default App;
