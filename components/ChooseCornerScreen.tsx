'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { setMyCorner, setTermsAccepted, getTermsAccepted } from '@/utils/corner'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

interface Props {
  onDone: () => void
}

export default function ChooseCornerScreen({ onDone }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [termsAccepted, setTermsAcceptedState] = useState(false)

  useEffect(() => {
    getTermsAccepted().then((accepted) => {
      if (accepted) setTermsAcceptedState(true)
    })
  }, [])

  async function useGPS() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
        setGpsError(false)
      },
      () => { setGpsLoading(false); setGpsError(true) },
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
      const a = data.address
      label = [a?.road, a?.city || a?.town || a?.village].filter(Boolean).join(', ')
    } catch {}
    await setMyCorner({ ...coords, label })
    if (termsAccepted) await setTermsAccepted()
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
      {gpsError && (
        <p className="text-sm text-stone-500 mt-2 text-center leading-relaxed">
          הדפדפן לא הצליח לאתר אתכם אוטומטית.
          אפשר לחפש כתובת בשורת החיפוש או ללחוץ על המפה.
        </p>
      )}

      <label className="flex items-start gap-3 mt-5 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAcceptedState(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#1b5e20] shrink-0"
        />
        <span className="text-sm text-stone-500 leading-relaxed">
          אני מסכים/ה{' '}
          <a href="/tos" className="underline text-stone-600" target="_blank" rel="noopener noreferrer">לתנאי השימוש</a>
          {' '}ול
          <a href="/privacy" className="underline text-stone-600" target="_blank" rel="noopener noreferrer">מדיניות הפרטיות</a>
        </span>
      </label>

      <button
        type="button"
        onClick={confirm}
        disabled={!coords || !termsAccepted || saving}
        className="w-full mt-5 bg-[#1b5e20] text-white font-bold text-base py-4 rounded-full active:scale-95 transition-transform disabled:opacity-50"
      >
        {saving ? 'שומר...' : 'אישור'}
      </button>

      {coords && (
        <p className="text-xs text-stone-400 mt-3 text-center">
          הפינה שנבחרה תשמש כברירת המחדל לצפייה ולפרסום.
        </p>
      )}
    </main>
  )
}
