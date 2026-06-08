'use client'

import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <main className="max-w-md mx-auto px-5 pb-16" dir="rtl">
      <div className="pt-6 pb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">&#8249;</button>
        <h1 className="text-lg font-extrabold text-stone-900">כללי קהילה</h1>
      </div>
      <div className="space-y-6 text-stone-600">
        <h2 className="text-base font-bold text-stone-900">שכונה טובה מתחילה כאן</h2>
        <p>HoodDo היא מקום לעזרה אמיתית בין שכנים.</p>
        <p className="text-sm text-stone-400">
          שאלות? hooddoapp@gmail.com
        </p>
      </div>
    </main>
  )
}
