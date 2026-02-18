import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
    Container,
    ModalContainer,
    ToastContainer,
    ErrorBoundary,
    GlobalLoading,
    ScrollTopButton,
    storage,
    getStore,
    setAccessToken,
    setUser,
} from '@sonhoseong/mfa-lib'
import { BlogHeader } from '@/components'
import App from '@/App'

function useLocalInitialize() {
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        try {
            const store = getStore();

            const savedToken = storage.getAccessToken();
            const savedUser = storage.getUser();

            if (savedToken) {
                store.dispatch(setAccessToken(savedToken))
            }
            if (savedUser) {
                store.dispatch(setUser(savedUser))
            }
            console.log('[Root] 초기화 완료')
        } catch (err) {
            console.error('[Root] 초기화 에러:', err)
        } finally {
            console.log('[Root] setInitialized(true) 호출')
            setInitialized(true)
        }
    }, [])

    return { initialized }
}

function Root() {
    const location = useLocation()
    const { initialized } = useLocalInitialize()

    const isLoginPage = location.pathname === '/login' || location.pathname === '/blog/login'

    if (!initialized) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--color-bg, #f8fafc)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e2e8f0',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b' }}>로딩 중...</p>
                </div>
            </div>
        )
    }

    if (isLoginPage) {
        return (
            <>
                <ModalContainer />
                <ToastContainer />
                <Container>
                    <ErrorBoundary>
                        <App />
                    </ErrorBoundary>
                </Container>
                <GlobalLoading />
            </>
        )
    }

    return (
        <>
            <ModalContainer />
            <ToastContainer />
            <Container>
                <ErrorBoundary>
                    <BlogHeader />
                    <main className="blog-main-content">
                        <App />
                    </main>
                    <GlobalLoading />
                </ErrorBoundary>
            </Container>
            <ScrollTopButton />
        </>
    )
}

export default Root