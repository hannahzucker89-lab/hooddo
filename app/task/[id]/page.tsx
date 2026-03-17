'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Task } from '@/lib/supabase'
import { buildWhatsAppLink } from '@/utils/phone'
import { calculateDistanceMeters, formatDistance } from '@/utils/distance'
import { getSavedPhone } from '@/utils/storage'
import { normalizeIsraeliPhone } from '@/utils/phone'

const RABIN_LAT = 32.0809
const RABIN_LNG = 34.7806

const TIME_LABEL: Record<string, string> = {
  עכשיו: '⚡ עכשיו',
  היום: '☀️ היום',
  מחר: '🌅 מחר',
}

export default function TaskPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isNew = searchParams.get('new') === '1'

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)
  const [closed, setClosed] = useState(false)

  const id = params?.id as string

  useEffect(() => {
    if (!id) return
    fetchTask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!task) return
    navigator.geolocation?.getCurrentPosition((pos) => {
      const taskLat = task.lat ?? RABIN_LAT
      const taskLng = task.lng ?? RABIN_LNG
      setDistance(
        calculateDistanceMeters(pos.coords.latitude, pos.coords.longitude, taskLat, taskLng)
      )
    })
  }, [task])

  async function fetchTask() {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single()
    if (!data) { setNotFound(true) } else { setTask(data) }
    setLoading(false)
  }

  async function closeTask() {
    if (!task) return
    setClosing(true)
    await supabase.from('tasks').update({ is_active: false }).eq('id', task.id)
    setClosed(true)
    setClosing(false)
  }

  const isOwner = task
    ? normalizeIsraeliPhone(getSavedPhone()) === normalizeIsraeliPhone(task.phone)
    : false

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-8">
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </main>
    )
  }

  if (notFound || !task) {
    return (
      <main className="max-w-md mx-auto px-4 pt-8 text-center">
        <p className="text-stone-500">המשימה לא נמצאה או הוסרה.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-green-700 font-semibold underline">
          חזרה לדף הבית
        </button>
      </main>
    )
  }

  // ── Post-publish confirmation screen ──
  if (isNew) {
    return (
      <main className="max-w-md mx-auto px-4 pt-12 text-center pb-12">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-extrabold text-stone-900 mb-2">המשימה פורסמה בהצלחה</h1>
        <p className="text-stone-500 text-sm mb-8">שכנים באזור יוכלו לראות אותה ולפנות אליך בוואטסאפ.</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => router.push('/new')}
            className="w-full bg-[#1b5e20] text-white font-bold text-base py-3.5 rounded-2xl shadow-sm active:scale-95 transition-transform"
          >
            ➕ פרסום משימה נוספת
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full border border-stone-200 text-stone-600 font-semibold text-base py-3.5 rounded-2xl active:scale-95 transition-transform"
          >
            חזרה למשימות באזור
          </button>
        </div>
      </main>
    )
  }

  // ── Closed confirmation ──
  if (closed) {
    return (
      <main className="max-w-md mx-auto px-4 pt-12 text-center pb-12">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-stone-700 font-semibold text-lg mb-6">המשימה נסגרה בהצלחה</p>
        <button
          onClick={() => router.push('/')}
          className="border border-stone-200 text-stone-600 font-semibold px-6 py-3 rounded-2xl active:scale-95 transition-transform"
        >
          חזרה למשימות באזור
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-12">

      {/* ── Header ── */}
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-extrabold text-stone-900">
          {isOwner ? 'ניהול משימה' : 'פרטי משימה'}
        </h1>
      </div>

      {/* ── Task card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-5">

        {/* Title + distance */}
        <div>
          <h2 className="text-xl font-bold leading-snug text-stone-900">{task.title}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-stone-500">
            {distance !== null && <span>📍 {formatDistance(distance)}</span>}
            <span className="text-xs text-stone-400">כיכר רבין</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <InfoBox label="מתי" value={TIME_LABEL[task.time_option] ?? task.time_option} />
          <InfoBox label="משך" value={`כ-${task.duration_minutes} דק׳`} />
          <InfoBox
            label="תגמול"
            value={task.reward_ils > 0 ? `${task.reward_ils} ₪` : 'ללא'}
            accent={task.reward_ils > 0}
          />
        </div>

        {/* Creator */}
        <div className="border-t border-stone-100 pt-4">
          <p className="text-sm text-stone-500">
            פורסם על ידי <span className="font-semibold text-stone-700">{task.display_name}</span>
          </p>
          {task.address_text && (
            <p className="text-sm text-stone-400 mt-1">📍 {task.address_text}</p>
          )}
        </div>

        {/* ── Action buttons ── */}
        {isOwner ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-stone-400">זו המשימה שפרסמת</p>
            <button
              onClick={closeTask}
              disabled={closing}
              className="w-full border border-red-200 text-red-500 font-semibold text-base py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {closing ? 'סוגר...' : 'סגירת משימה'}
            </button>
          </div>
        ) : (
          <a
            href={buildWhatsAppLink(task.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#25d366] text-white text-center font-bold text-lg py-4 rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            💬 רוצה לעזור
          </a>
        )}
      </div>
    </main>
  )
}

function InfoBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl py-3 px-2 ${accent ? 'bg-amber-50 border border-amber-100' : 'bg-stone-50 border border-stone-100'}`}>
      <div className="text-xs text-stone-400 mb-1">{label}</div>
      <div className={`text-sm font-bold ${accent ? 'text-amber-700' : 'text-stone-700'}`}>{value}</div>
    </div>
  )
}
