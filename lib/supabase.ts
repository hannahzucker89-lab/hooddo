import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Task = {
  id: string
  title: string
  time_option: 'עכשיו' | 'היום' | 'מחר'
  duration_minutes: number
  reward_ils: number
  display_name: string
  phone: string
  location_source: 'gps' | 'manual'
  address_text: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
}
