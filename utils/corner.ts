import { supabase } from '@/lib/supabase'

const KEY_CORNER = 'hooddo_my_corner'

export type Corner = {
  lat: number
  lng: number
  label?: string
}

export async function getMyCorner(): Promise<Corner | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.corner_lat != null && user?.user_metadata?.corner_lng != null) {
    return {
      lat: user.user_metadata.corner_lat,
      lng: user.user_metadata.corner_lng,
      label: user.user_metadata.corner_label,
    }
  }

  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY_CORNER)
  if (!raw) return null

  try {
    const corner = JSON.parse(raw) as Corner

    // Sync to user_metadata if user is authenticated but metadata is missing
    if (user) {
      await supabase.auth.updateUser({
        data: {
          corner_lat: corner.lat,
          corner_lng: corner.lng,
          corner_label: corner.label ?? null,
        },
      })
    }

    return corner
  } catch {
    return null
  }
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
