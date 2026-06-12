'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Task } from '@/lib/supabase'
import { itemType } from '@/lib/supabase'
import { formatDistance } from '@/utils/distance'
import { getSavedPhone } from '@/utils/storage'
import { normalizeIsraeliPhone } from '@/utils/phone'

interface Props {
  task: Task
  distanceMeters?: number
  highlight?: boolean
}

const TIME_LABEL: Record<string, string> = {
  מיידי: ' מיידי',
  השבוע: ' השבוע',
  גמיש: ' גמיש',
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
    setIsOwner(normalizeIsraeliPhone(saved) === normalizeIsraeliPhone(task.phone ?? ''))
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
        <div className="flex-1">
          <div className="text-sm text-stone-400 font-normal mb-0.5">
            {task.display_name}{' '}
            {itemType(task) === 'offer'
              ? task.verb_form === 'male' ? 'מציע' : task.verb_form === 'female' ? 'מציעה' : 'מציע/ה'
              : task.verb_form === 'male' ? 'מחפש' : task.verb_form === 'female' ? 'מחפשת' : 'מחפש/ת'
            }
          </div>
          <h2 className="text-lg font-semibold leading-snug">{task.title}</h2>
        </div>
      </div>

      {/* ── Description (offers) ── */}
      {isOffer && task.description && (
        <p className="text-sm text-stone-500 leading-relaxed mb-3 border-r-2 border-[#c5c6f7] pr-3">
          {task.description}
        </p>
      )}

      {/* ── Metadata ── */}
      <div className="flex flex-col gap-1.5 mb-4 text-base text-stone-600">
        {!isOffer && (
          <span>🕐 כ-{task.duration_minutes} דקות · {TIME_LABEL[task.time_option] ?? task.time_option}</span>
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
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-stone-100">
        {isOwner ? (
          <Link
            href={`/task/${task.id}`}
            className="text-stone-400 font-medium text-sm px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            ניהול
          </Link>
        ) : (
          <Link
            href={`/task/${task.id}`}
            className={`font-medium text-sm px-3 py-1.5 rounded-lg active:scale-95 transition-transform ${
              isOffer ? 'text-[#5c6bc0]' : 'text-[#2e7d32]'
            }`}
          >
            לפרטים נוספים
          </Link>
        )}
        <button
          onClick={async (e) => {
            e.preventDefault()
            const url = `${window.location.origin}/task/${task.id}`
            const isOffer = task.type === 'offer'
            const shareText = isOffer
              ? `ראיתי הצעה ב-HoodDo שחשבתי שיכולה להתאים לך — ${task.title}`
              : `ראיתי בקשה ב-HoodDo שחשבתי שיכולה להתאים לך — ${task.title}`
            if (navigator.share) {
              try {
                await navigator.share({ title: task.title, text: shareText, url })
              } catch {}
            } else {
              await navigator.clipboard.writeText(`${shareText}\n${url}`)
            }
          }}
          className="flex items-center gap-1.5 text-stone-400 text-sm px-3 py-1.5 rounded-full border border-stone-200 active:scale-95 transition-transform"
        >
          שיתוף
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 17L7 7"/>
            <path d="M17 7H7v10"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
