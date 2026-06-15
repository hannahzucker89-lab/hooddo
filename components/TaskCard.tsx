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
  variant?: 'public' | 'owner'
}

const TIME_LABEL: Record<string, string> = {
  מיידי: 'מיידי',
  השבוע: 'השבוע',
  גמיש: 'גמיש',
}

export default function TaskCard({ task, distanceMeters, highlight, variant = 'public' }: Props) {
  const [isOwner, setIsOwner] = useState(false)
  const isOffer = task.type === 'offer'

  useEffect(() => {
    const saved = getSavedPhone()
    if (!saved) return
    setIsOwner(normalizeIsraeliPhone(saved) === normalizeIsraeliPhone(task.phone ?? ''))
  }, [task.phone])

  const personLine = task.verb_form
    ? `${task.display_name} ${
        itemType(task) === 'offer'
          ? task.verb_form === 'male' ? 'מציע' : 'מציעה'
          : task.verb_form === 'male' ? 'מחפש' : 'מחפשת'
      }`
    : task.display_name

  return (
    <div
      className={`rounded-2xl p-4 border transition-colors ${
        isOffer
          ? 'bg-[#f6f6ff] border-[#d6d7f9]'
          : 'bg-[#f3faf4] border-[#bfe0c2]'
      } ${highlight ? 'shadow-sm' : ''}`}
    >
      {/* ── Person + type ── */}
      <div className="flex items-center gap-1.5 text-sm text-stone-500 mb-1">
        <span>{personLine}</span>
        <span className="text-stone-300">·</span>
        <span className={`font-semibold ${isOffer ? 'text-[#5c6bc0]' : 'text-[#1b5e20]'}`}>
          {isOffer ? 'הצעה' : 'בקשה'}
        </span>
      </div>

      {/* ── Category ── */}
      {task.category && (
        <div className="text-xs text-stone-400 mb-1">
          {task.category}
        </div>
      )}

      {/* ── Title ── */}
      <h2 className="text-lg font-semibold leading-snug mb-2">{task.title}</h2>

      {/* ── Metadata row ── */}
      <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
        {task.reward_ils > 0 ? (
          <span className="text-amber-700 font-medium">💰 {task.reward_ils} ₪</span>
        ) : (
          <span className="text-stone-400">ללא תמורה</span>
        )}
        {!isOffer && (
          <>
            <span className="text-stone-300">•</span>
            <span>⏱️ כ-{task.duration_minutes} דקות{task.time_option ? ` · ${TIME_LABEL[task.time_option] ?? task.time_option}` : ''}</span>
          </>
        )}
        {distanceMeters !== undefined && (
          <>
            <span className="text-stone-300">•</span>
            <span>📍 {formatDistance(distanceMeters)}</span>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/60">
        {!task.is_active && (
          <span className="text-xs text-stone-400 ml-auto">סגור</span>
        )}
        {(variant === 'owner' || isOwner) ? (
          <Link
            href={`/task/${task.id}`}
            className={`font-medium text-sm px-3 py-1.5 rounded-lg active:scale-95 transition-transform ${
              isOffer ? 'text-[#5c6bc0]' : 'text-[#2e7d32]'
            }`}
          >
            {isOffer ? 'ניהול ההצעה' : 'ניהול הבקשה'}
          </Link>
        ) : (
          <Link
            href={`/task/${task.id}`}
            className={`font-medium text-sm px-3 py-1.5 rounded-lg active:scale-95 transition-transform ${
              isOffer ? 'text-[#5c6bc0]' : 'text-[#2e7d32]'
            }`}
          >
            {isOffer ? 'לפרטי ההצעה' : 'לפרטי הבקשה'}
          </Link>
        )}
        <button
          onClick={async (e) => {
            e.preventDefault()
            const url = `${window.location.origin}/task/${task.id}`
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
          className="flex items-center gap-1.5 text-stone-400 text-sm px-3 py-1.5 rounded-full border border-stone-200 bg-white/70 active:scale-95 transition-transform"
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
