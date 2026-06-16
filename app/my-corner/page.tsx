'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyCorner, type Corner } from '@/utils/corner'
import ChooseCornerScreen from '@/components/ChooseCornerScreen'

export default function MyCornerPage() {
  const router = useRouter()
  const [corner, setCorner] = useState<Corner | null | undefined>(undefined)
  const [showPicker, setShowPicker] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getMyCorner().then((c) => {
      setCorner(c)
      if (!c) setShowPicker(true)
    })
  }, [])

  async function handleDone() {
    const updated = await getMyCorner()
    setCorner(updated)
    setShowPicker(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (corner === undefined) return null

  return (
    <main className="max-w-md mx-auto px-5 pb-16" dir="rtl">
      <div className="pt-6 pb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-extrabold text-stone-900">הפינה שלי</h1>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-medium">
          ✅ הפינה שלך עודכנה
        </div>
      )}

      {!showPicker && corner && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6 space-y-4">
          <div>
            <p className="text-stone-400 text-sm mb-1">📍 הפינה שלך</p>
            <p className="text-stone-900 font-bold text-base">
              {corner.label || 'המיקום שנבחר'}
            </p>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed">
            מכאן HoodDo מחשבת מרחקים ומציגה לך את מה שקורה בסביבה.
          </p>
          <button
            onClick={() => { setShowPicker(true); setSuccess(false) }}
            className="w-full border border-stone-200 rounded-xl py-3 text-sm text-stone-600 font-medium active:scale-95 transition-transform"
          >
            שינוי
          </button>
        </div>
      )}

      {showPicker && (
        <ChooseCornerScreen onDone={handleDone} />
      )}
    </main>
  )
}
