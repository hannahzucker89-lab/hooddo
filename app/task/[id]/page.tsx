'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Task } from '@/lib/supabase'
import { getSavedPhone } from '@/utils/storage'
import { normalizeIsraeliPhone } from '@/utils/phone'
import { calculateDistanceMeters, formatDistance } from '@/utils/distance'

type ViewerLocation = { lat: number; lng: number }

const TIME_LABEL: Record<string, string> = {
  מיידי: '⚡ מיידי',
  השבוע: '📅 השבוע',
  גמיש: '🕐 גמיש',
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isNew = searchParams.get('new') === '1'

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [closing, setClosing] = useState(false)
  const [viewerLocation, setViewerLocation] = useState<ViewerLocation | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (!data) { setLoading(false); return }

      setTask(data)
      setLoading(false)

      const saved = getSavedPhone()
      if (saved) {
        setIsOwner(normalizeIsraeliPhone(saved) === normalizeIsraeliPhone(data.phone))
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setViewerLocation(loc)
          if (data.lat && data.lng) {
            setDistance(calculateDistanceMeters(loc.lat, loc.lng, data.lat, data.lng))
          }
        })
      }
    }
    load()
  }, [id])

  async function closeTask() {
    if (!task || closing) return
    setClosing(true)
    await supabase.from('tasks').update({ is_active: false }).eq('id', task.id)
    router.push('/')
  }

  function buildWhatsApp() {
    if (!task) return '#'
    const isOffer = task.type === 'offer'
    const msg = isOffer
      ? `היי ${task.display_name}, ראיתי את ההצעה שלך ב-HoodDo ואשמח לקבל עזרה 🙏`
      : `היי ${task.display_name}, ראיתי את המשימה שלך ב-HoodDo ואשמח לעזור 🙏`
    return `https://wa.me/${task.phone}?text=${encodeURIComponent(msg)}`
  }

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-10">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-stone-100" />
          ))}
        </div>
      </main>
    )
  }

  if (!task) {
    return (
      <main className="max-w-md mx-auto px-4 pt-16 text-center">
        <p className="text-stone-500">הפריט לא נמצא</p>
        <button onClick={() => router.push('/')} className="mt-4 text-[#1b5e20] underline text-sm">
          חזרה לפיד
        </button>
      </main>
    )
  }

  const isOffer = task.type === 'offer'

  // ── Confirmation screen (shown right after publish) ──
  if (isNew) {
    return (
      <main className="max-w-md mx-auto px-4 pt-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">
          {isOffer ? 'ההצעה פורסמה בהצלחה' : 'המשימה פורסמה בהצלחה'}
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          {isOffer
            ? 'שכנים יוכלו לראות את ההצעה שלך ולפנות אליך'
            : 'שכנים יוכלו לראות את המשימה שלך ולעזור'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-[#1b5e20] text-white font-bold py-4 rounded-2xl mb-3"
        >
          חזרה לפיד
        </button>
        <button
          onClick={() => router.push(`/task/${task.id}`)}
          className="w-full border border-stone-200 text-stone-600 font-semibold py-3 rounded-2xl text-sm"
        >
          {isOffer ? 'צפה בהצעה' : 'צפה במשימה'}
        </button>
      </main>
    )
  }

  // ── Detail screen ──
  return (
    <main className="max-w-md mx-auto px-4 pb-12">

      <div className="pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-extrabold text-stone-900">
          {isOwner ? 'ניהול' : isOffer ? 'פרטי הצעה' : 'פרטי משימה'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-4">
        <h2 className="text-xl font-bold text-stone-900 mb-4">{task.title}</h2>

        <div className="flex flex-col gap-2 text-sm text-stone-600">
          <span>⏰ {task.duration_minutes > 0 ? `כ-${task.duration_minutes} דקות · ` : ''}{TIME_LABEL[task.time_option] ?? task.time_option}</span>
          {task.reward_ils > 0 ? (
            <span className="text-amber-700 font-medium">💰 {task.reward_ils} ₪</span>
          ) : (
            <span className="text-stone-400 text-xs">ללא תמורה</span>
          )}
          {distance !== null
            ? <span>📍 {formatDistance(distance)}</span>
            : <span className="text-xs text-stone-400">📍 באזור שלך</span>
          }
          {task.category && (
            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md w-fit">
              {task.category}
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-sm text-stone-500">{task.display_name}</span>
          {!task.is_active && (
            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">סגורה</span>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      {isOwner ? (
        <button
          onClick={closeTask}
          disabled={closing || !task.is_active}
          className="w-full border border-red-200 text-red-500 font-semibold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-40"
        >
          {closing ? 'סוגר...' : isOffer ? 'סגירת הצעה' : 'סגירת משימה'}
        </button>
      ) : task.is_active ? (
        <a
          href={buildWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-sm active:scale-95 transition-transform text-base"
        >
          {isOffer ? '💬 שליחת הודעה' : '💬 רוצה לעזור'}
        </a>
      ) : (
        <div className="text-center text-stone-400 text-sm py-4">הפריט כבר לא פעיל</div>
      )}

    </main>
  )
}
