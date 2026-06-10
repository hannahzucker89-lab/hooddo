'use client'

import { useRouter } from 'next/navigation'

export default function PublishPage() {
  const router = useRouter()

  return (
    <main className="max-w-md mx-auto px-5 pb-16" dir="rtl">
      <div className="pt-6 pb-8 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">&#8249;</button>
        <h1 className="text-xl font-extrabold text-stone-900">מה תרצו לפרסם?</h1>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => router.push('/new?type=task')}
          className="w-full text-right bg-[#f0faf1] border border-[#a5d6a7] rounded-2xl px-6 py-5 active:scale-95 transition-transform"
        >
          <div className="text-2xl mb-2">&#128269;</div>
          <div className="text-lg font-extrabold text-stone-900 mb-1">אני מחפש/ת</div>
          <div className="text-sm text-stone-500 leading-relaxed">משהו שהיית רוצה שמישהו מהאזור יעשה עבורך</div>
        </button>

        <button
          onClick={() => router.push('/new?type=offer')}
          className="w-full text-right bg-[#f4f4ff] border border-[#c5c6f7] rounded-2xl px-6 py-5 active:scale-95 transition-transform"
        >
          <div className="text-2xl mb-2">&#10024;</div>
          <div className="text-lg font-extrabold text-stone-900 mb-1">יש לי משהו להציע</div>
          <div className="text-sm text-stone-500 leading-relaxed">משהו שהיית רוצה לעשות עבור אנשים אחרים באזור</div>
        </button>
      </div>
    </main>
  )
}
