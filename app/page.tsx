'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, type Task } from '@/lib/supabase'
import TaskCard from '@/components/TaskCard'
import { calculateDistanceMeters } from '@/utils/distance'

type ViewerLocation = { lat: number; lng: number }

const RABIN_LAT = 32.0809
const RABIN_LNG = 34.7806
const MAX_DISTANCE = 500

const TASK_IDEAS = [
  { emoji: '🐶', label: 'טיול עם הכלב' },
  { emoji: '🪴', label: 'השקיית עציצים' },
  { emoji: '🧺', label: 'קיפול כביסה' },
  { emoji: '🔧', label: 'תליית מדף' },
  { emoji: '📱', label: 'עזרה עם הטלפון' },
  { emoji: '📦', label: 'סידור ארון' },
  { emoji: '🧾', label: 'עזרה בבירוקרטיה' },
]

export default function HomePage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerLocation, setViewerLocation] = useState<ViewerLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setTasks(data ?? [])
    setLoading(false)
  }

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => {
        setLocationDenied(true)
        setLocationLoading(false)
      },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }, [])

  const enrichedTasks = tasks
    .map((task) => {
      const taskLat = task.lat ?? RABIN_LAT
      const taskLng = task.lng ?? RABIN_LNG
      const dist = viewerLocation
        ? calculateDistanceMeters(viewerLocation.lat, viewerLocation.lng, taskLat, taskLng)
        : null
      return { task, dist }
    })
    .filter(({ dist }) => viewerLocation && dist !== null ? dist <= MAX_DISTANCE : true)
    .sort((a, b) => {
      if (viewerLocation && a.dist !== null && b.dist !== null && a.dist !== b.dist)
        return a.dist - b.dist
      return new Date(b.task.created_at).getTime() - new Date(a.task.created_at).getTime()
    })

  // Nearby filter active but no results within 500m
  const nearbyEmpty = viewerLocation && enrichedTasks.length === 0 && tasks.length > 0

  return (
    <main className="max-w-md mx-auto px-4 pb-10">

      {/* ── Header ── */}
      <div className="pt-7 pb-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">HoodDo 🏘️</h1>
        <p className="text-sm text-stone-500 mt-0.5">משימות בין שכנים באזור שלך</p>
        <p className="text-xs font-semibold text-[#1b5e20] mt-0.5">כיכר רבין</p>
      </div>

      {/* ── Tagline ── */}
      <p className="text-sm text-stone-500 leading-relaxed mt-3 mb-4">
        HoodDo מחבר בין שכנים שצריכים עזרה קטנה לשכנים שמוכנים לעזור.
      </p>

      {/* ── Prompt + CTA ── */}
      <p className="text-base font-semibold text-stone-700 mb-2">איך אפשר לעזור לך היום?</p>
      <Link
        href="/new"
        className="flex items-center justify-center gap-2 w-full bg-[#1b5e20] text-white font-bold text-base py-3.5 rounded-2xl shadow-sm active:scale-95 transition-transform mb-5"
      >
        ➕ פרסום משימה
      </Link>

      {/* ── Location button ── */}
      {!viewerLocation && !locationDenied && (
        <button
          onClick={requestLocation}
          disabled={locationLoading}
          className="w-full mb-4 flex items-center justify-center gap-2 border border-stone-200 bg-white rounded-xl py-3 text-sm text-stone-600 font-medium active:scale-95 transition-transform disabled:opacity-60"
        >
          {locationLoading
            ? <span className="animate-pulse">מאתר מיקום...</span>
            : <>📍 משימות עד 500 מ׳ ממך</>}
        </button>
      )}

      {viewerLocation && (
        <div className="mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-green-700 flex items-center justify-between">
          <span>📍 מציג משימות עד 500 מ׳ ממך</span>
          <button
            onClick={() => setViewerLocation(null)}
            className="text-xs text-stone-400 underline"
          >
            הצג הכל
          </button>
        </div>
      )}

      {locationDenied && (
        <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
          לא ניתן לגשת למיקום – מציג משימות באזור כיכר רבין
        </div>
      )}

      {/* ── Feed ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-28 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : nearbyEmpty ? (
        <NearbyEmptyState onShowAll={() => setViewerLocation(null)} />
      ) : enrichedTasks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
            משימות שמחכות לעזרה באזור
          </p>
          <div className="space-y-3">
            {enrichedTasks.map(({ task, dist }, index) => (
              <TaskCard
                key={task.id}
                task={task}
                distanceMeters={dist !== null ? dist : undefined}
                highlight={index === 0}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

function NearbyEmptyState({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div className="mt-6 text-center px-2">
      <p className="text-stone-500 text-base mb-3">
        כרגע אין משימות בטווח 500 מ׳ מהמיקום הזה.
      </p>
      <button
        onClick={onShowAll}
        className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-600 font-semibold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform"
      >
        חזרה למשימות באזור
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-6 text-center px-2">
      <p className="text-stone-500 text-base mb-3">
        אין משימות כרגע באזור שלך.
      </p>
      <p className="text-sm text-stone-400 leading-relaxed mb-5">
        HoodDo מחבר בין שכנים שצריכים עזרה קטנה לשכנים שמוכנים לעזור.
      </p>
      <p className="text-base font-semibold text-stone-700 mb-3">איך אפשר לעזור לך היום?</p>
      <Link
        href="/new"
        className="inline-flex items-center justify-center gap-2 bg-[#1b5e20] text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-sm active:scale-95 transition-transform"
      >
        ➕ פרסום משימה
      </Link>
      <TaskIdeasList />
    </div>
  )
}

function TaskIdeasList() {
  return (
    <div className="mt-7 text-right">
      <p className="text-xs text-stone-400 mb-3 font-semibold">רעיונות למשימות</p>
      <div className="flex flex-wrap gap-2">
        {TASK_IDEAS.map(({ emoji, label }) => (
          <Link
            key={label}
            href={`/new?idea=${encodeURIComponent(emoji + ' ' + label)}`}
            className="text-sm bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            {emoji} {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
