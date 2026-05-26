'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase, type Task, CATEGORIES_LIST } from '@/lib/supabase'
import TaskCard from '@/components/TaskCard'
import { calculateDistanceMeters } from '@/utils/distance'

type ViewerLocation = { lat: number; lng: number }
type Tab = 'tasks' | 'offers'

const TAB_SUBTITLE: Record<Tab, string> = {
  tasks: 'בקשות קטנות שפרסמו שכנים מסביבתך',
  offers: 'דברים ששכנים בסביבתך מציעים',
}

const HINT_KEY = 'hooddo_hints_done_v2'

function radiusLabel(meters: number, tab: Tab): string {
  const type = tab === 'tasks' ? 'משימות' : 'הצעות'
  if (meters < 1000) return `${type} עד ${meters} מ׳ ממך`
  const km = meters / 1000

  return `${type} עד ${km % 1 === 0 ? km : km.toFixed(1)} ק״מ ממך`
}

function SpeechBubble({ hint, onDismiss }: {
  hint: 'tabs-tasks' | 'tabs-offers' | 'distance' | 'filter'
  onDismiss: () => void
}) {
  const config = {
    'distance': { text: 'אפשר לבחור את המרחק שנוח לך', top: '148px' },
    'tabs-tasks': { text: 'אפשר לעבור בין בקשות להצעות', top: '220px' },
    'tabs-offers': { text: 'אפשר לעבור בין בקשות להצעות', top: '220px' },
    'filter': { text: 'אפשר לסנן לפי מה שרלוונטי לך', top: '310px' },
  }

  const { text, top } = config[hint]

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ background: 'rgba(0,0,0,0.15)', animation: 'fadeIn 0.25s ease' }}
      onClick={onDismiss}
      dir="rtl"
    >
      <div
        className="absolute"
        style={{ top, right: '24px', left: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <div style={{
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white',
          }} />
        </div>
        <div
          className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
        >
          <p className="text-sm text-stone-700 flex-1">{text}</p>
          <button
            onClick={onDismiss}
            className="text-xs font-bold text-[#1b5e20] shrink-0 active:scale-95 transition-transform"
          >
            הבנתי
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [allItems, setAllItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('tasks')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [viewerLocation, setViewerLocation] = useState<ViewerLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [radius, setRadius] = useState(500)
  const [rewardFilter, setRewardFilter] = useState<'all' | 'paid' | 'free'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [hint, setHint] = useState<'tabs-tasks' | 'tabs-offers' | 'distance' | 'filter' | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(HINT_KEY)
      if (!done) setHint('distance')
    }
  }, [])

  function dismissHint() {
  if (hint === 'distance') {
    setHint('tabs-tasks')
  } else if (hint === 'tabs-tasks' || hint === 'tabs-offers') {
    setHint('filter')
  } else {
    setHint(null)
    localStorage.setItem(HINT_KEY, 'true')
  }
}

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setAllItems(data ?? [])
    setLoading(false)
  }

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationDenied(true); return }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => { setLocationDenied(true); setLocationLoading(false) },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }, [])

  useEffect(() => { requestLocation() }, [requestLocation])

  function toggleCategory(label: string) {
    setSelectedCategories(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    )
  }

  function isExpired(item: Task): boolean {
    const created = new Date(item.created_at).getTime()
    const now = Date.now()
    const hours = (now - created) / (1000 * 60 * 60)
    if (item.time_option === 'מיידי') return hours > 25
    if (item.time_option === 'השבוע') return hours > 24 * 8
    if (item.exact_date) return new Date(item.exact_date) < new Date(new Date().toDateString())
    return false
  }

  const tabFiltered = allItems.filter((item) =>
    (tab === 'tasks' ? item.type === 'task' : item.type === 'offer') && !isExpired(item)
  )

  const filtered = tabFiltered.filter((item) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category ?? '')) return false
    return true
  })

  const enriched = filtered
    .map((item) => {
      const dist =
        viewerLocation && item.lat && item.lng
          ? calculateDistanceMeters(viewerLocation.lat, viewerLocation.lng, item.lat, item.lng)
          : null
      return { item, dist }
    })
    .filter(({ dist }) => viewerLocation && dist != null ? dist <= radius : true)
    .sort((a, b) => {
      if (viewerLocation && a.dist != null && b.dist != null && a.dist !== b.dist)
        return a.dist - b.dist
      return new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime()
    })

  const nearbyEmpty = viewerLocation && enriched.length === 0 && tabFiltered.length > 0
  const isTask = tab === 'tasks'

  return (
    <main className="max-w-md mx-auto px-4 pb-28">

      {/* ── Logo ── */}
      <div className="pt-8 pb-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">HoodDo 🏘️</h1>
        <p className="text-sm font-medium text-stone-600 mt-1 mb-0">
          לפעמים הפתרון נמצא ממש מעבר לפינה
        </p>
      </div>

      <div className="mb-4" />

      {/* ── Location + radius strip ── */}
      <div className="mb-4 px-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-400">
            {locationLoading
              ? '📍 מאתר מיקום...'
              : viewerLocation
              ? '📍 מיקום נוכחי'
              : '📍 מיקום לא הוגדר'}
          </span>
          {viewerLocation ? (
            <button onClick={() => setViewerLocation(null)} className="text-xs text-stone-400 underline">
              נקה
            </button>
          ) : (
            <button
              onClick={() => { setLocationDenied(false); requestLocation() }}
              className="text-xs text-[#1b5e20] font-semibold underline"
            >
              {locationLoading ? '' : 'בחירת מיקום'}
            </button>
          )}
        </div>

        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          onChange={(e) => setRadius(2200 - Number(e.target.value))}
          value={2200 - radius}
          className="w-full"
          style={{ direction: 'rtl' }}
        />

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-stone-300">2 ק״מ</span>
          <span className="text-xs text-stone-400">{radiusLabel(radius, tab)}</span>
          <span className="text-xs text-stone-300">200 מ׳</span>
        </div>

      </div>

      {/* ── Tabs ── */}
      <div className="mb-4">
        <div className="flex gap-1 bg-stone-100 p-1 rounded-full mb-2">
          <button
            onClick={() => setTab('tasks')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
              tab === 'tasks' ? 'bg-white text-[#1b5e20] shadow-sm' : 'text-stone-400'
            }`}
          >
            בקשות בשכונה
          </button>
          <button
            onClick={() => setTab('offers')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
              tab === 'offers' ? 'bg-white text-[#5c6bc0] shadow-sm' : 'text-stone-400'
            }`}
          >
            הצעות בשכונה
          </button>
        </div>

        <p
          key={tab}
          className={`text-xs text-center mt-1.5 transition-opacity ${
            tab === 'tasks' ? 'text-[#2e7d32]' : 'text-[#5c6bc0]'
          }`}
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          {TAB_SUBTITLE[tab]}
        </p>

     <button
          onClick={() => setShowFilters(prev => !prev)}
          className={`flex items-center gap-1 text-xs mt-2 px-3 py-1 rounded-full border transition-colors w-full justify-center ${
            showFilters || selectedCategories.length > 0 || rewardFilter !== 'all'
              ? 'bg-stone-100 text-stone-600 border-stone-300'
              : 'bg-white text-stone-400 border-stone-200'
          }`}
        >
          🔽 סינון
          {(selectedCategories.length > 0 || rewardFilter !== 'all') && (
            <span className="bg-[#1b5e20] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {selectedCategories.length + (rewardFilter !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div>
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
              <button
                onClick={() => setSelectedCategories([])}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  selectedCategories.length === 0
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                הכל
              </button>
              {CATEGORIES_LIST.map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => toggleCategory(label)}
                  className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                    selectedCategories.includes(label)
                      ? tab === 'offers'
                        ? 'bg-[#5c6bc0] text-white border-[#5c6bc0]'
                        : 'bg-[#1b5e20] text-white border-[#1b5e20]'
                      : 'bg-white text-stone-500 border-stone-200'
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {([['all', 'הכל'], ['paid', '₪ בתשלום'], ['free', '🤝 ללא תמורה']] as ['all' | 'paid' | 'free', string][]).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setRewardFilter(val)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  rewardFilter === val
                    ? 'bg-stone-600 text-white border-stone-600'
                    : 'bg-white text-stone-400 border-stone-200'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
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
        <NearbyEmptyState onShowAll={() => setViewerLocation(null)} isTask={isTask} />
      ) : enriched.length === 0 ? (
        <EmptyState isTask={isTask} />
      ) : (
        <div className="space-y-3">
          {enriched.map(({ item, dist }, index) => (
            <TaskCard
              key={item.id}
              task={item}
              distanceMeters={dist ?? undefined}
              highlight={index === 0}
            />
          ))}
        </div>
      )}

      {/* ── FAB ── */}
      <Link
        href={tab === 'offers' ? '/new?type=offer' : '/new?type=task'}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-lg active:scale-95 transition-transform whitespace-nowrap z-40 ${
          tab === 'offers' ? 'bg-[#5c6bc0]' : 'bg-[#1b5e20]'
        }`}
      >
        {tab === 'offers' ? 'הצעה חדשה' : 'בקשה חדשה'}
      </Link>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0.3; transform: translateY(-2px); }
          to   { opacity: 1;   transform: translateY(0); }
        }
        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          background: #e7e5e4;
          border-radius: 2px;
          outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #a8a29e;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #a8a29e;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
      `}</style>

{hint && (
  <SpeechBubble hint={hint} onDismiss={dismissHint} />
)}

    </main>
  )
}

function NearbyEmptyState({ onShowAll, isTask }: { onShowAll: () => void; isTask: boolean }) {
  return (
    <div className="mt-6 text-center px-2">
      <p className="text-stone-500 text-base mb-3">
        {isTask ? 'כרגע אין בקשות בטווח הזה.' : 'כרגע אין הצעות בטווח הזה.'}
      </p>
      <button
        onClick={onShowAll}
        className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-600 font-semibold px-6 py-3 rounded-full text-sm active:scale-95 transition-transform"
      >
        הצג הכל באזור
      </button>
    </div>
  )
}

function EmptyState({ isTask }: { isTask: boolean }) {
  return (
    <div className="mt-8 text-center px-2">
      <p className="text-stone-500 text-base mb-2">
        {isTask ? 'אין בקשות כרגע באזור שלך.' : 'אין הצעות כרגע באזור שלך.'}
      </p>
      <p className="text-sm text-stone-400 leading-relaxed mb-5">
        {isTask
          ? 'אפשר לפרסם בקשה ושכנים יוכלו לראות.'
          : 'אפשר לפרסם הצעה ושכנים יוכלו לפנות.'}
      </p>
    </div>
  )
}