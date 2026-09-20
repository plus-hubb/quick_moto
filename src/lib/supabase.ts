import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Client สำหรับลูกค้า (เก็บ session ใน localStorage key ปกติ)
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)

// Client สำหรับแอดมิน (เก็บ session ใน localStorage key แยก → ไม่ทับกัน)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storageKey: 'sb-admin-auth'
    }
  }
)
