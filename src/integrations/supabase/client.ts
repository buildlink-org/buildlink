
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://umrjdbjycjpqwyaczsmf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcmpkYmp5Y2pwcXd5YWN6c21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDY1MzUsImV4cCI6MjA2NDUyMjUzNX0.NwfntVL5rMRYjk_SApc5qgkN-219wwwIbc19C_syuyU'

// supabase-js derives its localStorage key from the project ref when `storageKey`
// isn't set explicitly (sb-<ref>-auth-token). We mirror that here so AuthContext
// can read the persisted session synchronously without waiting on the SDK.
export const AUTH_STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
