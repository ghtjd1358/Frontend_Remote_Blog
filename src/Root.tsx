/**
 * Root Component - KOMCA 패턴
 * 앱의 최상위 레이아웃 컴포넌트
 */

import React from 'react';
import App from './App';

interface RootProps {
    isStandalone?: boolean;
}

const Root: React.FC<RootProps> = ({ isStandalone = false }) => {
    return <App />;
};

export default Root;
