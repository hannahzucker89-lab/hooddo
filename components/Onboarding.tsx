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
  const [screen, setScreen] = useState<1 | 2>(1)
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
          {[1, 2].map((s) => (
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
              <div className="text-4xl mb-2">🏘️</div>
              <h2 className="text-xl font-bold text-stone-900 leading-snug">
                HoodDo מחברת בין שכנים שצריכים עזרה קטנה לאנשים בסביבה שיכולים לעזור.
              </h2>
              <div className="flex flex-col gap-2 mt-4">
                {EXAMPLES.map(({ emoji, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-4 py-3 text-stone-700 text-sm font-medium shadow-sm"
                  >
                    <span className="text-xl">{emoji}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === 2 && (
            <div className="space-y-5">
              {/* Animated tabs preview */}
              <div className="bg-stone-100 p-1 rounded-2xl flex gap-1 mb-2">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === 'tasks' ? 'bg-white text-[#1b5e20] shadow-sm' : 'text-stone-400'
                  }`}
                >
                  🙋 משימות בשכונה
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === 'offers' ? 'bg-white text-[#5c6bc0] shadow-sm' : 'text-stone-400'
                  }`}
                >
                  🤝 הצעות בשכונה
                </button>
              </div>

              {/* Tab description */}
              <div
                key={activeTab}
                className="bg-white border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 shadow-sm"
                style={{ animation: 'fadeIn 0.2s ease' }}
              >
                {activeTab === 'tasks'
                  ? 'בקשות קטנות מהשכונה'
                  : 'דברים ששכנים שמחים לעזור בהם'}
              </div>

              <p className="text-stone-500 text-sm leading-relaxed mt-2">
                אפשר לפרסם משימה קטנה
                <br />
                או להציע עזרה לאחרים בסביבה
              </p>
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
