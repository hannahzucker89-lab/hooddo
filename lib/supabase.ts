import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) console.error('[HoodDo] Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) console.error('[HoodDo] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ItemType = 'task' | 'offer'
export const CATEGORIES_LIST = [
  { emoji: '🧹', label: 'סדר וארגון' },
  { emoji: '🐶', label: 'חיות' },
  { emoji: '🪴', label: 'בית וצמחים' },
  { emoji: '🛍', label: 'סידורים וקניות' },
  { emoji: '👶', label: 'ילדים ומשפחה' },
  { emoji: '📱', label: 'טכנולוגיה' },
  { emoji: '🍲', label: 'אוכל ואירוח' },
  { emoji: '📚', label: 'למידה ' },
  { emoji: '✨', label: 'אחר' },
] as const

export const CATEGORIES = {
  task: [
    { emoji: '🧹', label: 'סדר וארגון' },
    { emoji: '🐶', label: 'חיות' },
    { emoji: '🪴', label: 'בית וצמחים' },
    { emoji: '🛍', label: 'סידורים וקניות' },
    { emoji: '👶', label: 'ילדים ומשפחה' },
    { emoji: '📱', label: 'טכנולוגיה' },
    { emoji: '🍲', label: 'אוכל ואירוח' },
    { emoji: '📚', label: 'למידה' },
    { emoji: '✨', label: 'אחר' },
  ],
  offer: [
    { emoji: '🧹', label: 'סדר וארגון' },
    { emoji: '🐶', label: 'חיות' },
    { emoji: '🪴', label: 'בית וצמחים' },
    { emoji: '🛍', label: 'סידורים וקניות' },
    { emoji: '👶', label: 'ילדים ומשפחה' },
    { emoji: '📱', label: 'טכנולוגיה' },
    { emoji: '🍲', label: 'אוכל ואירוח' },
    { emoji: '📚', label: 'למידה' },
    { emoji: '✨', label: 'אחר' },
  ],
} as const

export type Task = {
  id: string
  title: string
description: string | null
  type: ItemType | null          // null = legacy row, treat as 'task'
  category: string | null
exact_date: string | null
  time_option: 'מיידי' | 'השבוע' | 'גמיש'
  duration_minutes: number
  reward_ils: number
  display_name: string
  phone?: string
  location_source: 'gps' | 'manual'
  address_text: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
}

/** Normalise legacy rows: missing type → 'task' */
export function itemType(task: Task): ItemType {
  return task.type ?? 'task'
}
