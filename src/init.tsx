import { storage, initSupabase } from '@sonhoseong/mfa-lib'

storage.removeHostApp()

// Standalone 실행 시 Supabase 초기화
initSupabase({
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL!,
    supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY!,
})
