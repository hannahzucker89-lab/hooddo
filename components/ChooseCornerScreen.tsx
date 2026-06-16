'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { setMyCorner } from '@/utils/corner'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

interface Props {
  onDone: () => void
}

export default function ChooseCornerScreen({ onDone }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function useGPS() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
      },
      () => { setGpsLoading(false) },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }

  async function confirm() {
    if (!coords) return
    setSaving(true)
    let label: string | undefined
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&accept-language=he`,
        { headers: { 'User-Agent': 'HoodDo/1.0' } }
      )
      const data = await res.json()
      label = data.display_name?.split(',').slice(0, 2).join(', ')
    } catch {}
    await setMyCorner({ ...coords, label })
    onDone()
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-10 pb-12">
      <div className="text-4xl mb-3 text-center">📍</div>
      <h1 className="text-xl font-extrabold text-stone-900 mb-2 text-center">בחרו את הפינה שלכם</h1>
      <p className="text-sm text-stone-500 leading-relaxed mb-6 text-center">
        בחרו מקום שממנו תרצו לראות ולפרסם.<br />
        HoodDo תשתמש בפינה הזו כדי לחשב מרחקים ולהציג לכם את מה שקורה בסביבה.<br />
        אפשר לשנות את הבחירה בכל רגע.
      </p>

      <LocationPicker selected={coords} onSelect={setCoords} />

      <button
        type="button"
        onClick={useGPS}
        disabled={gpsLoading}
        className="w-full mt-3 border border-stone-200 bg-white rounded-xl py-3 text-sm text-stone-600 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
      >
        {gpsLoading ? <span className="animate-pulse">מאתר מיקום...</span> : <>📍 השתמש במיקום הנוכחי</>}
      </button>

      <button
        type="button"
        onClick={confirm}
        disabled={!coords || saving}
        className="w-full mt-5 bg-[#1b5e20] text-white font-bold text-base py-4 rounded-full active:scale-95 transition-transform disabled:opacity-50"
      >
        {saving ? 'שומר...' : 'אישור'}
      </button>
    </main>
  )
}
