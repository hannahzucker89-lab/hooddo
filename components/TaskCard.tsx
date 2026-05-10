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
  מיידי: '⚡ מיידי',
  השבוע: '📅 השבוע',
  גמיש: '🕐 גמיש',
}

function isRecent(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
}

export default function TaskCard({ task, distanceMeters, highlight }: Props) {
  const recent = isRecent(task.created_at)
  const [isOwner, setIsOwner] = useState(false)
  const isOffer = task.type === 'offer'

  useEffect(() => {
    const saved = getSavedPhone()
    if (!saved) return
    setIsOwner(normalizeIsraeliPhone(saved) === normalizeIsraeliPhone(task.phone))
  }, [task.phone])

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm border transition-colors ${
        highlight
          ? isOffer
            ? 'bg-[#f0f0ff] border-[#c5c6f7]'
            : 'bg-[#f0faf1] border-[#a5d6a7]'
          : 'bg-white border-stone-100'
      }`}
    >
      {/* ── Title row ── */}
      <div className="flex items-start gap-2 mb-3">
        {recent && (
          <span className={`mt-0.5 shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md leading-tight text-white ${
            isOffer ? 'bg-[#5c6bc0]' : 'bg-[#1b5e20]'
          }`}>
            חדש
          </span>
        )}
        {task.category && (
          <span className="mt-0.5 shrink-0 text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
            {task.category}
          </span>
        )}
        <h2 className="text-base font-semibold leading-snug flex-1">{task.title}</h2>
      </div>

      {/* ── Description (offers) ── */}
      {isOffer && task.description && (
        <p className="text-sm text-stone-500 leading-relaxed mb-3 border-r-2 border-[#c5c6f7] pr-3">
          {task.description}
        </p>
      )}

      {/* ── Metadata ── */}
      <div className="flex flex-col gap-1.5 mb-4 text-sm text-stone-600">
        {!isOffer && (
          <span>⏰ כ-{task.duration_minutes} דקות · {TIME_LABEL[task.time_option] ?? task.time_option}</span>
        )}
        {task.reward_ils > 0 ? (
          <span className="text-amber-700 font-medium">💰 {task.reward_ils} ₪</span>
        ) : (
          <span className="text-stone-400 text-xs">ללא תמורה</span>
        )}
        {distanceMeters !== undefined && (
          <span>📍 {formatDistance(distanceMeters)} ממך</span>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-400">{task.display_name}</span>
        <div className="flex gap-2">
          <button
            onClick={async (e) => {
              e.preventDefault()
              const url = `${window.location.origin}/task/${task.id}`
              if (navigator.share) {
                await navigator.share({ title: task.title, url })
              } else {
                await navigator.clipboard.writeText(url)
              }
            }}
            className="text-stone-400 text-xs px-2 py-2 border border-stone-200 rounded-xl active:scale-95 transition-transform"
          >
            🔗
          </button>
          {isOwner ? (
            <Link
              href={`/task/${task.id}`}
              className="bg-stone-100 text-stone-500 font-semibold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              ניהול
            </Link>
          ) : (
            <Link
              href={`/task/${task.id}`}
              className={`font-semibold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform ${
                isOffer
                  ? 'bg-[#ede7f6] text-[#5c6bc0]'
                  : 'bg-[#e8f5e9] text-[#2e7d32]'
              }`}
            >
              {isOffer ? 'שליחת הודעה' : 'לפרטים נוספים'}
            </Link>
          )}
        </div>
      </div>
  )
}
