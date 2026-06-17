'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Task } from '@/lib/supabase'
import { getSavedPhone } from '@/utils/storage'
import { normalizeIsraeliPhone } from '@/utils/phone'
import { calculateDistanceMeters, formatDistance } from '@/utils/distance'
import { getMyCorner } from '@/utils/corner'

type ViewerLocation = { lat: number; lng: number }

const TIME_LABEL: Record<string, string> = {
  מיידי: '⚡ מיידי',
  השבוע: '📅 השבוע',
  גמיש: '🕐 גמיש',
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isNew = searchParams.get('new') === '1'

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [closing, setClosing] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [shared, setShared] = useState(false)
const [whatsappUrl, setWhatsappUrl] = useState<string>('#')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tasks')
        .select('id, type, category, title, description, time_option, duration_minutes, reward_ils, display_name, is_active, created_at, lat, lng, user_id')
        .eq('id', id)
        .single()

      if (!data) { setLoading(false); return }

      setTask(data as Task)

const { data: phoneData } = await supabase.rpc('get_task_phone', { task_id: id })
const phone = phoneData?.[0]?.phone
if (phone) {
  const isOffer = data.type === 'offer'
  const msg = isOffer
    ? `היי ${data.display_name}, ראיתי את ההצעה שלך ב-HoodDo ואשמח לקבל עזרה 🙏`
    : `היי ${data.display_name}, ראיתי את הבקשה שלך ב-HoodDo ואשמח לעזור 🙏`
  setWhatsappUrl(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`)
}
      const token = localStorage.getItem(`hooddo_token_${data.id}`)
      const { data: { user } } = await supabase.auth.getUser()
      setIsOwner(!!token || (!!user && user.id === (data as Task).user_id))
      setLoading(false)

      const corner = await getMyCorner()
      if (corner && data.lat && data.lng) {
        setDistance(calculateDistanceMeters(corner.lat, corner.lng, data.lat, data.lng))
      }
    }
    load()
  }, [id])

  async function closeTask() {
  if (!task || closing) return
  setClosing(true)
  const token = localStorage.getItem(`hooddo_token_${task.id}`)
  if (token) {
    const { data: success } = await supabase.rpc('close_task', {
      task_id: task.id,
      token
    })
    if (success) { router.push('/'); return }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.id === task.user_id) {
    const { error } = await supabase
      .from('tasks')
      .update({ is_active: false })
      .eq('id', task.id)
      .eq('user_id', user.id)
    if (!error) { router.push('/'); return }
  }
  setClosing(false)
}

  async function buildWhatsApp() {
  if (!task) return '#'
  const { data } = await supabase.rpc('get_task_phone', { task_id: task.id })
  const phone = data?.[0]?.phone
  if (!phone) return '#'
  const isOffer = task.type === 'offer'
  const msg = isOffer
    ? `היי ${task.display_name}, ראיתי את ההצעה שלך ב-HoodDo ואשמח לקבל עזרה 🙏`
    : `היי ${task.display_name}, ראיתי את הבקשה שלך ב-HoodDo ואשמח לעזור 🙏`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

  async function handleShare() {
  if (!task) return
  const url = window.location.href
  const isOffer = task.type === 'offer'
  const shareText = isOffer
    ? `ראיתי הצעה ב-HoodDo שחשבתי שיכולה להתאים לך — ${task.title}`
    : `ראיתי בקשה ב-HoodDo שחשבתי שיכולה להתאים לך — ${task.title}`

  if (navigator.share) {
    try {
      await navigator.share({ title: task.title, text: shareText, url })
    } catch {}
  } else {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`
    window.open(waUrl, '_blank')
  }
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

  // ── Confirmation screen ──
  if (isNew) {
    return (
      <main className="max-w-md mx-auto px-4 pt-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">
          {isOffer ? 'ההצעה נשלחה לשכונה' : 'הבקשה נשלחה לשכונה'}
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          {isOffer
            ? 'שכנים יוכלו לראות את ההצעה שלך ולפנות אליך'
            : 'שכנים יוכלו לראות את הבקשה שלך ולעזור'}
        </p>
        <button
          onClick={() => router.push(`/task/${task.id}`)}
          className="w-full bg-[#1b5e20] text-white font-bold py-4 rounded-full mb-3"
        >
          ניהול הפרסום
        </button>
        <button
          onClick={() => router.push('/publish')}
          className="w-full border border-stone-200 text-stone-600 font-semibold py-3 rounded-full text-sm mb-3"
        >
          ➕ פרסום נוסף
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-stone-400 text-sm underline"
        >
          חזרה לפיד
        </button>
      </main>
    )
  }

  // ── Detail screen ──
  return (
    <main className="max-w-md mx-auto px-4 pb-12">

      <div className="pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-extrabold text-stone-900 flex-1">
          {isOwner ? 'ניהול' : isOffer ? 'פרטי ההצעה' : 'פרטי הבקשה'}
        </h1>
      <button
  onClick={handleShare}
  className="flex items-center gap-1.5 text-stone-400 text-sm px-3 py-1.5 border border-stone-200 rounded-full active:scale-95 transition-transform"
>
  {shared ? '✓ הועתק' : (
    <>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 17L7 7"/>
        <path d="M17 7H7v10"/>
      </svg>
      שיתוף
    </>
  )}
</button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-4">
        <h2 className="text-xl font-bold text-stone-900 mb-4">{task.title}</h2>

        {task.description && (
          <p className="text-sm text-stone-500 leading-relaxed mb-4 border-r-2 border-stone-100 pr-3">
            {task.description}
          </p>
        )}

        <div className="flex flex-col gap-2 text-sm text-stone-600">
          {!isOffer && (
            <span>⏰ {task.duration_minutes > 0 ? `כ-${task.duration_minutes} דקות · ` : ''}{TIME_LABEL[task.time_option] ?? task.time_option}</span>
          )}
          {task.reward_ils > 0 ? (
            <span className="text-amber-700 font-medium">💰 {task.reward_ils} ₪</span>
          ) : (
            <span className="text-stone-400 text-xs">ללא תמורה</span>
          )}
          {distance !== null
            ? <span>📍 {formatDistance(distance)} ממך</span>
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
      {!task.is_active ? (
        <div className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center space-y-2">
          <div className="text-2xl">✅</div>
          <p className="font-bold text-stone-700 text-base">נסגר</p>
          <p className="text-sm text-stone-400 leading-relaxed">פרסום זה אינו מופיע יותר בפיד ואינו זמין ליצירת קשר.</p>
          <button
            onClick={() => router.push('/my-tasks')}
            className="mt-3 w-full border border-stone-200 text-stone-500 font-semibold py-3 rounded-full text-sm active:scale-95 transition-transform"
          >
            חזרה לפרסומים שלי
          </button>
        </div>
      ) : isOwner ? (
        <button
          onClick={closeTask}
          disabled={closing}
          className="w-full border border-red-200 text-red-500 font-semibold py-3.5 rounded-full text-sm active:scale-95 transition-transform disabled:opacity-40"
        >
          {closing ? 'סוגר...' : isOffer ? 'סגירת הצעה' : 'סגירת בקשה'}
        </button>
      ) : (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-4 rounded-full shadow-sm active:scale-95 transition-transform text-base"
        >
          💬 יצירת קשר
        </a>
      )}

    </main>
  )
}
