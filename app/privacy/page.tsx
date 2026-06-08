'use client'

import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <main className="max-w-md mx-auto px-5 pb-16" dir="rtl">
      <div className="pt-6 pb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-extrabold text-stone-900">פרטיות</h1>
      </div>

      <div className="space-y-6 text-[15px] text-stone-600 leading-[1.8]">

        <h2 className="text-base font-bold text-stone-900">איך אנחנו מטפלים במידע שלך</h2>

        <p>HoodDo היא פלטפורמה שכונתית. אנחנו אוספים מידע מינימלי כדי שהשירות יעבוד.</p>

        <div>
          <p className="font-semibold text-stone-700 mb-1">מה אנחנו אוספים</p>
          <p>כשאת/ה מפרסמ/ת בקשה או הצעה, אנחנו שומרים את שם הכינוי שבחרת, מספר הטלפון המאומת, ומיקום משוער לצורך חישוב מרחק בין שכנים.</p>
        </div>

        <div>
          <p className="font-semibold text-stone-700 mb-1">מה שכנים אחרים רואים</p>
          <p>שם הכינוי, כותרת הבקשה או ההצעה, קטגוריה, תמורה משוערת, ומרחק משוער ממך. המיקום המדויק שלך לא נחשף לאף אחד.</p>
        </div>

        <div>
          <p className="font-semibold text-stone-700 mb-1">מה נשאר פרטי</p>
          <p>מספר הטלפון שלך נחשף רק כשמישהו לוחץ על כפתור "יצירת קשר". הוא לא מוצג בפיד הכללי.</p>
        </div>

        <div>
          <p className="font-semibold text-stone-700 mb-1">איך אנחנו משתמשים במידע</p>
          <p>אך ורק כדי לאפשר את פעולת השירות — חישוב מרחק, הצגת בקשות רלוונטיות, ויצירת קשר בין שכנים.</p>
        </div>

        <div className="h-px bg-stone-100" />

        <p className="text-sm text-stone-400">
          שאלות על פרטיות?{' '}
          <a href="mailto:hooddoapp@gmail.com" className="text-[#1b5e20] underline">
            hooddoapp@gmail.com
          </a>
        </p>

      </div>
    </main>
  )
}