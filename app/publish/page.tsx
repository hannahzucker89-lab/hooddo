'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PublishPage() {
  const router = useRouter()
  const [pendingType, setPendingType] = useState<'task' | 'offer' | null>(null)

  async function handleTypeSelect(type: 'task' | 'offer') {
    const localPref = localStorage.getItem('hooddo_pending_verb_form')
    if (localPref === 'male' || localPref === 'female') {
      router.push(`/new?type=${type}`)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    const existing = user?.user_metadata?.verb_form
    if (existing === 'male' || existing === 'female') {
      router.push(`/new?type=${type}`)
      return
    }
    setPendingType(type)
  }

  async function handleVerbForm(form: 'male' | 'female') {
    localStorage.setItem('hooddo_pending_verb_form', form)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.auth.updateUser({ data: { verb_form: form } })
    }
    router.push(`/new?type=${pendingType}`)
  }

  if (pendingType) {
    return (
      <main className="max-w-md mx-auto px-5 pb-16" dir="rtl">
        <div className="pt-6 pb-8 flex items-center gap-3">
          <button onClick={() => setPendingType(null)} className="text-stone-400 text-2xl leading-none">‹</button>
          <h1 className="text-xl font-extrabold text-stone-900">בחרו את הניסוח שמתאים לכם</h1>
        </div>
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          כך הפרסומים שלכם יוצגו בפיד. אפשר לשנות את הבחירה בהמשך.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => handleVerbForm('male')}
            className="w-full text-right bg-white border border-stone-200 rounded-2xl px-6 py-5 active:scale-95 transition-transform"
          >
            <div className="text-lg font-bold text-stone-900">מחפש / מציע</div>
          </button>
          <button
            onClick={() => handleVerbForm('female')}
            className="w-full text-right bg-white border border-stone-200 rounded-2xl px-6 py-5 active:scale-95 transition-transform"
          >
            <div className="text-lg font-bold text-stone-900">מחפשת / מציעה</div>
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-5 pb-16" dir="rtl">
      <div className="pt-6 pb-8 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-extrabold text-stone-900">מה תרצו לפרסם?</h1>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => handleTypeSelect('task')}
          className="w-full text-right bg-[#f0faf1] border border-[#a5d6a7] rounded-2xl px-6 py-5 active:scale-95 transition-transform"
        >
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-lg font-extrabold text-stone-900 mb-1">אני מחפש/ת</div>
          <div className="text-sm text-stone-500 leading-relaxed">משהו שהיית רוצה שמישהו מהאזור יעשה עבורך</div>
        </button>
        <button
          onClick={() => handleTypeSelect('offer')}
          className="w-full text-right bg-[#f4f4ff] border border-[#c5c6f7] rounded-2xl px-6 py-5 active:scale-95 transition-transform"
        >
          <div className="text-2xl mb-2">✨</div>
          <div className="text-lg font-extrabold text-stone-900 mb-1">יש לי משהו להציע</div>
          <div className="text-sm text-stone-500 leading-relaxed">משהו שהיית רוצה לעשות עבור אנשים אחרים באזור</div>
        </button>
      </div>
    </main>
  )
}
