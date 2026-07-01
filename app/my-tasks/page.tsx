'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase, type Task } from '@/lib/supabase'
import TaskCard from '@/components/TaskCard'
import HamburgerMenu from '@/components/HamburgerMenu'
import PhoneAuthModal from '@/components/PhoneAuthModal'
import { logEvent } from '@/utils/analytics'

type FilterType = 'all' | 'task' | 'offer'

export default function MyTasksPage() {
  const [user, setUser] = useState<{ id: string } | null | undefined>(undefined)
  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    logEvent('my_tasks_viewed')
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser ? { id: authUser.id } : null)

      if (authUser) {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
        setItems(data ?? [])
      }
      setLoading(false)
    }
    init()
  }, [])

  function isExpired(item: Task): boolean {
    if (item.type === 'offer') return false
    const created = new Date(item.created_at).getTime()
    const now = Date.now()
    const hours = (now - created) / (1000 * 60 * 60)
    if (item.exact_date) return new Date(item.exact_date) < new Date(new Date().toDateString())
    if (item.time_option === 'מיידי') return hours > 25
    if (item.time_option === 'השבוע') return hours > 24 * 8
    return false
  }

  const filterFn = (item: Task) => filter === 'all' || item.type === filter

  const activeItems = items.filter((item) => item.is_active && !isExpired(item) && filterFn(item))
  const expiredItems = items.filter((item) => item.is_active && isExpired(item) && filterFn(item))
  const closedItems = items.filter((item) => !item.is_active && filterFn(item))

  const emptyLabel = filter === 'task'
    ? 'בקשות שיקבלו מענה יופיעו כאן'
    : filter === 'offer'
    ? 'הצעות שיסגרו יופיעו כאן'
    : 'פרסומים שנסגרו יופיעו כאן'

  const activeHeader = filter === 'task' ? 'בקשות פעילות' : filter === 'offer' ? 'הצעות פעילות' : 'פעילים'
  const expiredHeader = filter === 'offer' ? 'הצעות שפג תוקפן' : 'פג תוקף'
  const closedHeader = filter === 'task' ? 'בקשות שנסגרו' : filter === 'offer' ? 'הצעות שנסגרו' : 'נסגרו'

  return (
    <main className="max-w-md mx-auto px-4 pb-28">

      <div className="pt-8 pb-0 flex items-start justify-between">
        <div>
          <Link href="/" className="text-sm text-stone-400 flex items-center gap-1 mb-2">‹חזרה למסך הבית</Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">הפרסומים שלי</h1>
          <p className="text-sm font-medium text-stone-500 mt-1 mb-0">
            כל הבקשות וההצעות שפרסמת במקום אחד.
          </p>
        </div>
        <HamburgerMenu />
      </div>

      <div className="mb-4" />

      {user === undefined || loading ? (
        <div className="space-y-3 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-28 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : user === null ? (
        <AuthRequiredState onAuthClick={() => setShowAuth(true)} />
      ) : (
        <>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-full mb-4">
            {(['all', 'task', 'offer'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === f
                    ? f === 'offer'
                      ? 'bg-white text-[#5c6bc0] shadow-sm'
                      : 'bg-white text-[#1b5e20] shadow-sm'
                    : 'text-stone-400'
                }`}
              >
                {f === 'all' ? 'הכל' : f === 'task' ? 'בקשות' : 'הצעות'}
              </button>
            ))}
          </div>

          {activeItems.length === 0 && expiredItems.length === 0 && closedItems.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-2">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">{activeHeader}</h2>
                {activeItems.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-4">אין פרסומים פעילים כרגע</p>
                ) : (
                  <div className="space-y-3">
                    {activeItems.map((item) => (
                      <TaskCard key={item.id} task={item} variant="owner" />
                    ))}
                  </div>
                )}
              </div>

              {expiredItems.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">{expiredHeader}</h2>
                  <p className="text-xs text-stone-400 mb-3">החלון שבחרת חלף — הפרסום כבר לא מופיע בפיד לשכנים</p>
                  <div className="space-y-3">
                    {expiredItems.map((item) => (
                      <TaskCard key={item.id} task={item} variant="owner" />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">{closedHeader}</h2>
                {closedItems.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-4">{emptyLabel}</p>
                ) : (
                  <div className="space-y-3">
                    {closedItems.map((item) => (
                      <TaskCard key={item.id} task={item} variant="owner" />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {showAuth && (
        <PhoneAuthModal
          onSuccess={async () => {
            setShowAuth(false)
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser ? { id: authUser.id } : null)
            if (authUser) {
              setLoading(true)
              const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
              setItems(data ?? [])
              setLoading(false)
            }
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </main>
  )
}

function AuthRequiredState({ onAuthClick }: { onAuthClick: () => void }) {
  return (
    <div className="mt-8 text-center px-2">
      <p className="text-stone-700 text-base font-semibold mb-2">
        כדי לראות ולנהל את הפרסומים שלך צריך להתחבר.
      </p>
      <p className="text-sm text-stone-400 leading-relaxed mb-5">
        ההתחברות מתבצעת באמצעות אימות טלפון.
      </p>
      <button
        onClick={onAuthClick}
        className="bg-[#1b5e20] text-white font-bold text-base px-8 py-3 rounded-full active:scale-95 transition-transform"
      >
        התחברות
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-8 text-center px-2">
      <p className="text-stone-500 text-base mb-2">עדיין לא פרסמת כלום</p>
      <p className="text-sm text-stone-400 leading-relaxed mb-5">
        כאן יופיעו הבקשות וההצעות שיצרת.
      </p>
      <Link
        href="/publish"
        className="inline-block bg-[#1b5e20] text-white font-bold text-base px-8 py-3 rounded-full active:scale-95 transition-transform"
      >
        ➕ פרסום חדש
      </Link>
    </div>
  )
}
