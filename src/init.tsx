import { storage } from '@sonhoseong/mfa-lib'

storage.removeHostApp()

// Standalone 실행 시 Supabase 초기화
async function initializeSupabase() {
    try {
        const { initSupabase } = await import('@sonhoseong/mfa-lib')
        if (typeof initSupabase === 'function') {
            initSupabase({
                supabaseUrl: process.env.REACT_APP_SUPABASE_URL!,
                supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY!,
            })
        }
    } catch (e) {
        console.warn('[Init] initSupabase not available:', e)
    }
}

initializeSupabase()
