'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Task } from '@/lib/supabase'
import { formatDistance } from '@/utils/distance'
import { getSavedPhone } from '@/utils/storage'
import { normalizeIsraeliPhone } from '@/utils/phone'

interface Props {
  task: Task
  distanceMeters?: number
  highlight?: boolean
}

const TIME_LABEL: Record<string, string> = {
  עכשיו: '⚡ עכשיו',
  היום: '☀️ היום',
  מחר: '🌅 מחר',
}

function isRecent(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
}

export default function TaskCard({ task, distanceMeters, highlight }: Props) {
  const recent = isRecent(task.created_at)
  const [isOwner, setIsOwner] = useState(false)

  // Read localStorage only on client after mount
  useEffect(() => {
    const saved = getSavedPhone()
    if (!saved) return
    setIsOwner(
      normalizeIsraeliPhone(saved) === normalizeIsraeliPhone(task.phone)
    )
  }, [task.phone])

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm border transition-colors ${
        highlight ? 'bg-[#f0faf1] border-[#a5d6a7]' : 'bg-white border-stone-100'
      }`}
    >
      {/* ── Title row ── */}
      <div className="flex items-start gap-2 mb-3">
        {recent && (
          <span className="mt-0.5 shrink-0 text-xs font-bold bg-[#1b5e20] text-white px-1.5 py-0.5 rounded-md leading-tight">
            חדש
          </span>
        )}
        <h2 className="text-base font-semibold leading-snug flex-1">{task.title}</h2>
      </div>

      {/* ── Metadata lines ── */}
      <div className="flex flex-col gap-1.5 mb-4 text-sm text-stone-600">
        <span>⏰ כ-{task.duration_minutes} דקות · {TIME_LABEL[task.time_option] ?? task.time_option}</span>
        <span className={task.reward_ils > 0 ? 'text-amber-700 font-medium' : 'text-stone-500'}>
          💰 {task.reward_ils > 0 ? `${task.reward_ils} ₪` : 'ללא תגמול'}
        </span>
        {distanceMeters !== undefined && (
          <span>📍 {formatDistance(distanceMeters)}</span>
        )}
        <span className="text-xs text-stone-400">כיכר רבין</span>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-400">{task.display_name}</span>

        {isOwner ? (
          <Link
            href={`/task/${task.id}`}
            className="bg-stone-100 text-stone-500 font-semibold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            ניהול משימה
          </Link>
        ) : (
          <Link
            href={`/task/${task.id}`}
            className="bg-[#e8f5e9] text-[#2e7d32] font-semibold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            לעזור במשימה
          </Link>
        )}
      </div>
    </div>
  )
}
