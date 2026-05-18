'use client'

import { useState } from 'react'

const KEY_DONE = 'hooddo_onboarding_done'

export function useOnboardingDone(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(KEY_DONE) === 'true'
}

interface Props {
  onComplete: () => void
}

const EXAMPLES = [
  { emoji: '🐶', label: 'טיול עם הכלב' },
  { emoji: '🪴', label: 'השקיית עציצים' },
  { emoji: '📦', label: 'סידור ארון' },
]

export default function Onboarding({ onComplete }: Props) {
  const [screen, setScreen] = useState<1 | 2 | 3>(1)
  const [activeTab, setActiveTab] = useState<'tasks' | 'offers'>('tasks')

  function finish() {
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
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === screen ? 'w-8 bg-[#1b5e20]' : s < screen ? 'w-4 bg-[#a5d6a7]' : 'w-4 bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">

          {screen === 1 && (
  <div className="space-y-5">
    <img src="/Ob1.svg" alt="" className="w-64 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-stone-900 leading-snug">
      שכנים עוזרים לשכנים
    </h2>
    <p className="text-stone-500 text-lg leading-relaxed">
      כי לפעמים הפתרון נמצא ממש מעבר לפינה.
    </p>
  </div>
)}
          {screen === 2 && (
  <div className="space-y-5">
    <img src="/Ob2.svg" alt="" className="w-64 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-stone-900 leading-snug">
      אפשר לבקש ואפשר להציע
    </h2>
    <p className="text-stone-500 text-lg leading-relaxed">
      כי כולנו צריכים עזרה קטנה מדי פעם, ולפעמים אנחנו דווקא פנויים לעזור.
      HoodDo עושה את החיבור בין שכנים קרובים.
    </p>
  </div>
)}

          {screen === 3 && (
  <div className="space-y-5">
    <img src="/Ob3.svg" alt="" className="w-64 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-stone-900 leading-snug">
      הכל קרוב אליך
    </h2>
    <p className="text-stone-500 text-lg leading-relaxed">
      רק דברים מהסביבה שלך — במרחק שנוח לך, ובלי לחשוף כתובת מדויקת.
    </p>
    <p className="text-stone-400 text-sm">
   הכתובת לא נחשפת — רק המרחק ביניכם
</p>
    </div>
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
              המשך
            </button>
          )}
          {screen === 2 && (
            <button
              onClick={() => setScreen(3)}
              className="w-full bg-[#1b5e20] text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform"
            >
              המשך
            </button>
          )}
          {screen === 3 && (
            <button
              onClick={finish}
              className="w-full bg-[#1b5e20] text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform"
            >
              יאללה
            </button>
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0.3; transform: translateY(-3px); }
          to   { opacity: 1;   transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
