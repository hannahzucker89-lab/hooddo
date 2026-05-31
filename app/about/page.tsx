'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function ExpandedAbout({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#faf9f7] overflow-y-auto">
      <div className="max-w-md mx-auto px-6 pt-12 pb-20">

        {/* Close */}
        <button
          onClick={onClose}
          className="mb-10 flex items-center gap-2 text-stone-400 text-sm active:scale-95 transition-transform"
        >
          ‹ חזרה
        </button>

        {/* Hero line */}
        <h1 className="text-2xl font-extrabold text-stone-900 leading-snug mb-10">
          אנשים קרובים.<br />
          <span className="text-stone-400 font-normal">אפשרויות חדשות.</span>
        </h1>

        <div className="space-y-7 text-stone-600 text-[16px] leading-[1.85]">

          <p>
            יש משהו קצת מוזר בעולם של היום.
          </p>

          <p>
            מצד אחד, אנחנו מחוברים כל הזמן.<br />
            ומצד שני, הרבה אנשים מרגישים לבד, עמוסים או מנותקים מהסביבה הקרובה שלהם.
          </p>

          <p>
            יש אנשים שאין להם זמן לדברים הקטנים של היומיום.<br />
            ויש אנשים שיש להם זמן, יכולות, ניסיון או פשוט רצון לעשות משהו משמעותי יותר עם עצמם.
          </p>

          {/* Emphasis block */}
          <div className="border-r-2 border-stone-200 pr-4 space-y-2 text-stone-500 text-[15px]">
            <p>לפעמים מישהי אוהבת לסדר ארונות.</p>
            <p>מישהו נהנה לטייל עם כלבים.</p>
            <p>מישהי טובה בצמחים.</p>
            <p>מישהו סבלני להסביר טכנולוגיה.</p>
          </div>

          <p className="text-stone-500 text-sm">
            אלה לא תמיד דברים שמופיעים בקורות חיים.<br />
            אבל יש להם ערך אמיתי.
          </p>

          <div className="h-px bg-stone-100" />

          <p>
            HoodDo התחיל מהמחשבה שאולי השכונה יכולה לחזור להיות מקום קצת יותר חי, אנושי ומחובר.
          </p>

          <p>
            מקום שבו אנשים לא רק גרים אחד ליד השני — אלא גם יכולים להיעזר, להכיר, להציע, לבקש ולהרגיש חלק ממשהו קרוב יותר.
          </p>

          <div className="h-px bg-stone-100" />

          <p className="text-stone-500">
            כרגע HoodDo מתמקד במשימות קטנות מהיומיום.
          </p>

          <p>
            אבל מבחינתנו, זאת רק ההתחלה.
          </p>

          <p>
            אנחנו מדמיינים עתיד שבו אנשים יוכלו לחשוב מחדש על הזמן שלהם, על היכולות שלהם, ועל הדברים שהם אוהבים לעשות — גם אם הם קטנים, פשוטים או לא ״מקצוע רשמי״.
          </p>

          <p>
            עתיד שבו קהילה, הדדיות וחיבורים אנושיים יהפכו לחלק חשוב יותר מהחיים היומיומיים.
          </p>

          <div className="h-px bg-stone-100" />

          <p className="text-stone-400 text-sm">
            אולי הטכנולוגיה תמשיך להחליף הרבה דברים.
          </p>

          <p className="text-stone-700 font-medium">
            אבל אנחנו מאמינים שהיא יכולה גם לעזור לאנשים להתקרב מחדש.
          </p>

        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  return (
    <>
      {expanded && <ExpandedAbout onClose={() => setExpanded(false)} />}

      <main className="max-w-md mx-auto px-5 pb-16">

        {/* Header */}
        <div className="pt-6 pb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
          <h1 className="text-lg font-extrabold text-stone-900">אודות</h1>
        </div>

        {/* Short about card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-7">

          <h2 className="text-xl font-extrabold text-stone-900 leading-snug mb-5">
            אנשים קרובים.<br />
            <span className="text-stone-400 font-normal">אפשרויות חדשות.</span>
          </h2>

          <div className="space-y-4 text-[15px] text-stone-600 leading-[1.8]">
            <p>
              HoodDo הוא מרחב שכונתי שמחבר בין אנשים סביב דברים קטנים מהיומיום.
            </p>

            <p>
              אפשר לפרסם משימות, להציע זמן או יכולות, וליצור חיבורים מקומיים פשוטים עם אנשים מהאזור שלך.
            </p>

            <p>
              הכול מבוסס על קרבה, אנושיות והרעיון שלפעמים הפתרון נמצא ממש ליד הבית.
            </p>

            <div className="h-px bg-stone-100 my-2" />

            <p className="text-stone-500 text-sm leading-relaxed">
              אנחנו מאמינים שבעולם שהופך דיגיטלי ומרוחק יותר, דווקא קהילה מקומית, הדדיות וחיבורים אמיתיים בין אנשים יהפכו לחשובים יותר.
            </p>

            <p className="text-stone-400 text-sm">
              כרגע זה מתחיל ממשימות קטנות.<br />
              אבל מבחינתנו, זאת גם דרך לחשוב מחדש על זמן, יכולות וקהילה.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => setExpanded(true)}
            className="mt-7 flex items-center gap-1.5 text-sm font-semibold text-[#1b5e20] active:opacity-70 transition-opacity"
          >
            עוד על HoodDo
            <span className="text-base">→</span>
          </button>

        </div>

      </main>
    </>
  )
}
