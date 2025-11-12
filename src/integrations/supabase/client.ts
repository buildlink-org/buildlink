
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://umrjdbjycjpqwyaczsmf.supabase.co'
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcmpkYmp5Y2pwcXd5YWN6c21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDY1MzUsImV4cCI6MjA2NDUyMjUzNX0.NwfntVL5rMRYjk_SApc5qgkN-219wwwIbc19C_syuyU'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) 
console.log({supabase});

