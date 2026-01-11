/**
 * Bootstrap - KOMCA 패턴
 * 앱 부팅 및 초기화 담당
 *
 * Host에서 실행: window.__REDUX_STORE__ 사용 (Host가 생성한 store)
 * 단독 실행: fallback store 생성 (개발/테스트용)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Root from './Root';
import './global.css';

declare global {
    interface Window {
        __REDUX_STORE__?: ReturnType<typeof configureStore>;
    }
}

// 단독 실행용 fallback store (Host 없이 개발할 때만 사용)
const createFallbackStore = () =>
    configureStore({
        reducer: {
            app: (state = { user: null, accessToken: null, isAuthenticated: false, isLoading: false }) => state,
        },
    });

// Host의 store 사용, 없으면 fallback
const getStore = () => window.__REDUX_STORE__ ?? createFallbackStore();
const isStandalone = !window.__REDUX_STORE__;

// DOM 마운트
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <Provider store={getStore()}>
            <BrowserRouter>
                <Root isStandalone={isStandalone} />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);

console.log(`Blog App: ${isStandalone ? 'Standalone' : 'In Host'}`);
