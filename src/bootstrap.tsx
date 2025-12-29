import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import './global.css';

console.log('🚀 App Starting...');

// 단독 실행 여부 확인 (Host에서 실행되면 window.__REDUX_STORE__가 존재)
const isStandalone = !window.__REDUX_STORE__;

// 단독 실행시 사용할 기본 store
const standaloneStore = configureStore({
    reducer: {
        app: (state = { user: null, isAuthenticated: false, isLoading: false }) => state,
    },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// 단독 실행시에만 Provider로 감싸기 (Host에서는 Host의 Provider 사용)
if (isStandalone) {
    console.log('📦 Running in standalone mode');
    root.render(
        <React.StrictMode>
            <Provider store={standaloneStore}>
                <App />
            </Provider>
        </React.StrictMode>
    );
} else {
    console.log('🔗 Running in Host container');
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

console.log('✅ App Rendered');
