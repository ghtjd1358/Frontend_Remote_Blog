import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { createAppStore, ToastProvider, ModalProvider, storage} from '@sonhoseong/mfa-lib'
import Root from '@/Root'
import './styles/global.css'

const store = createAppStore()

async function start() {
    const rootElement = document.getElementById('root')
    if (!rootElement) throw new Error('Root element not found')

    // 단독 실행 시 body에 standalone 클래스 추가
    if (!storage.isHostApp()) {
        document.body.classList.add('standalone')
    }

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Provider store={store}>
                <ToastProvider>
                    <ModalProvider>
                        <BrowserRouter>
                            <Root />
                        </BrowserRouter>
                    </ModalProvider>
                </ToastProvider>
            </Provider>
        </React.StrictMode>
    )
}

start()
