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
      <div className="space-y-6 text-[15px] text-stone-600 leading-[1.8]">
        <h2 className="text-base font-bold text-stone-900">שכונה טובה מתחילה כאן</h2>
        <p>HoodDo היא מקום לעזרה אמיתית בין שכנים. כדי שזה יישאר כך, יש כמה כללים פשוטים.</p>
        <div>
          <p className="font-semibold text-stone-700 mb-1">מה מותר</p>
          <p>לפרסם בקשות והצעות אמיתיות, לפנות לשכנים בנימוס ובכבוד, ולהשתמש בפלטפורמה לדברים קטנים מהיומיום.</p>
        </div>
        <div>
          <p className="font-semibold text-stone-700 mb-1">מה לא מותר</p>
          <p>פרסום ספאם או מודעות מסחריות, הטרדה או פנייה לא ראויה לשכנים, פרסום פרטים אישיים של אחרים, ושימוש בפלטפורמה למטרות שאינן עזרה שכונתית.</p>
        </div>
        <div>
          <p className="font-semibold text-stone-700 mb-1">אחריות אישית</p>
          <p>כל משתמש אחראי על התוכן שהוא מפרסם. HoodDo שומרת לעצמה את הזכות להסיר תוכן שאינו הולם.</p>
        </div>
        <div className="h-px bg-stone-100" />
        <p className="text-sm text-stone-400">
          ראית משהו לא בסדר? hooddoapp@gmail.com
        </p>
      </div>
    </main>
  )
}
