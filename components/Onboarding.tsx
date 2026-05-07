'use client'

import { useState } from 'react'
import { saveName } from '@/utils/storage'

const KEY_DONE = 'hooddo_onboarding_done'

export function useOnboardingDone(): boolean {
  if (typeof window === 'undefined') return true
  return (
    localStorage.getItem(KEY_DONE) === 'true' &&
    (localStorage.getItem('hooddo_name') ?? '') !== ''
  )
}

interface Props {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: Props) {
  const [screen, setScreen] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  function finish() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(true)
      return
    }
    saveName(trimmed)
    localStorage.setItem(KEY_DONE, 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f9f7f4] flex flex-col" dir="rtl">
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-6 py-10">

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === screen ? 'w-8 bg-[#1b5e20]' : s < screen ? 'w-4 bg-[#a5d6a7]' : 'w-4 bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">

          {screen === 1 && (
            <div className="space-y-4">
              <div className="text-4xl mb-4">🏘️</div>
              <h2 className="text-xl font-bold text-stone-900 leading-snug">
                HoodDo מחברת בין שכנים שצריכים עזרה קטנה —
              </h2>
              <p className="text-stone-600 leading-relaxed text-base">
                לאנשים בסביבה שיכולים לעזור
              </p>
              <p className="text-stone-500 leading-relaxed text-sm">
                למשל טיול עם הכלב, סידור ארון
                <br />
                או דברים קטנים ביום־יום שלא תמיד מתאפשר להגיע אליהם
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                כי לפעמים הפתרון נמצא ממש מעבר לפינה
              </p>
            </div>
          )}

          {screen === 2 && (
            <div className="space-y-4">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-xl font-bold text-stone-900 leading-snug">
                HoodDo מאפשרת לפרסם משימות קטנות לסביבה
              </h2>
              <p className="text-stone-600 leading-relaxed text-base">
                תמורת תגמול — או פשוט לעזור לאחרים מהזמן והיכולות
              </p>
            </div>
          )}

          {screen === 3 && (
            <div className="space-y-5">
              <div className="text-4xl mb-2">👋</div>
              <h2 className="text-xl font-bold text-stone-900">
                מה השם שיופיע באפליקציה?
              </h2>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(false) }}
                placeholder="השם שלי"
                className={`w-full border rounded-xl px-4 py-3 text-base text-right bg-white outline-none focus:ring-2 focus:ring-[#1b5e20] transition ${
                  error ? 'border-red-400' : 'border-stone-200'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm">יש להזין שם כדי להמשיך</p>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8">
          {screen === 1 && (
            <button
              onClick={() => setScreen(2)}
              className="w-full bg-[#1b5e20] text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform"
            >
              הבא
            </button>
          )}
          {screen === 2 && (
            <button
              onClick={() => setScreen(3)}
              className="w-full bg-[#1b5e20] text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform"
            >
              הבנתי ✓
            </button>
          )}
          {screen === 3 && (
            <button
              onClick={finish}
              className="w-full bg-[#1b5e20] text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform"
            >
              התחלה
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
