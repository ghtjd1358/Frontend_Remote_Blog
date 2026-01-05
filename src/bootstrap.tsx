import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Header } from './components/layout';
import './global.css';

// 단독 실행 여부 확인 (Host에서 실행되면 window.__REDUX_STORE__가 존재)
const isStandalone = !window.__REDUX_STORE__;

// 단독 실행시 사용할 기본 store
const standaloneStore = configureStore({
    reducer: {
        app: (state = { user: null, isAuthenticated: false, isLoading: false }) => state,
    },
});

// Root 컴포넌트 - KOMCA 패턴
const Root: React.FC = () => {
    useEffect(() => {
        if (isStandalone) {
            document.body.classList.add('has-header');
        }
        return () => {
            document.body.classList.remove('has-header');
        };
    }, []);

    return (
        <>
            <Header isStandalone={isStandalone} />
            <App />
        </>
    );
};

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
                    <Root />
                </BrowserRouter>
            </Provider>
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <Root />
            </BrowserRouter>
        </React.StrictMode>
    );
}

console.log('Blog App Rendered', isStandalone ? '(Standalone)' : '(In Host)');
