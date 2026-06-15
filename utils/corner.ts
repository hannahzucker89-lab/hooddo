import { supabase } from '@/lib/supabase'

const KEY_CORNER = 'hooddo_my_corner'

export type Corner = {
  lat: number
  lng: number
  label?: string
}

export async function getMyCorner(): Promise<Corner | null> {
  // Try localStorage first for instant UI
  let cached: Corner | null = null
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(KEY_CORNER)
    if (raw) {
      try {
        cached = JSON.parse(raw) as Corner
      } catch {
        cached = null
      }
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.corner_lat != null && user?.user_metadata?.corner_lng != null) {
    const fromMetadata: Corner = {
      lat: user.user_metadata.corner_lat,
      lng: user.user_metadata.corner_lng,
      label: user.user_metadata.corner_label,
    }
    // Sync to localStorage in background if different
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY_CORNER, JSON.stringify(fromMetadata))
    }
    return fromMetadata
  }

  if (cached) {
    // Sync cached value to user_metadata if authenticated but metadata is missing
    if (user) {
      await supabase.auth.updateUser({
        data: {
          corner_lat: cached.lat,
          corner_lng: cached.lng,
          corner_label: cached.label ?? null,
        },
      })
    }
    return cached
  }

  return null
}

export async function setMyCorner(corner: Corner): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_CORNER, JSON.stringify(corner))
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.updateUser({
      data: {
        corner_lat: corner.lat,
        corner_lng: corner.lng,
        corner_label: corner.label ?? null,
      },
    })
  }
}