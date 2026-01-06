/**
 * Bootstrap - KOMCA 패턴
 * 앱 부팅 및 초기화 담당
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Root from './Root';
import './global.css';

// 단독 실행 여부 확인 (Host에서 실행되면 window.__REDUX_STORE__가 존재)
const isStandalone = !window.__REDUX_STORE__;

// 단독 실행시 사용할 기본 store
const standaloneStore = configureStore({
    reducer: {
        app: (state = { user: null, isAuthenticated: false, isLoading: false }) => state,
    },
});

// DOM 마운트
const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

if (isStandalone) {
    root.render(
        <React.StrictMode>
            <Provider store={standaloneStore}>
                <BrowserRouter>
                    <Root isStandalone={isStandalone} />
                </BrowserRouter>
            </Provider>
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <Root isStandalone={isStandalone} />
            </BrowserRouter>
        </React.StrictMode>
    );
}

console.log('Blog App Rendered', isStandalone ? '(Standalone)' : '(In Host)');
