/**
 * Root Component - KOMCA 패턴
 * 앱의 최상위 레이아웃 컴포넌트
 */

import React, { useEffect } from 'react';
import App from './App';
import { Header } from './components/layout';

interface RootProps {
    isStandalone: boolean;
}

const Root: React.FC<RootProps> = ({ isStandalone }) => {
    useEffect(() => {
        if (isStandalone) {
            document.body.classList.add('has-header');
        }
        return () => {
            document.body.classList.remove('has-header');
        };
    }, [isStandalone]);

    return (
        <>
            <Header isStandalone={isStandalone} />
            <App />
        </>
    );
};

export default Root;
