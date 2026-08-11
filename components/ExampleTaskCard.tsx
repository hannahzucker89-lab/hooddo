'use client'

import Link from 'next/link'
import type { EmptyStateExample } from '@/lib/emptyStateExamples'

export default function ExampleTaskCard({ example }: { example: EmptyStateExample }) {
  const isOffer = example.type === 'offer'

  return (
    <div
      className={`relative rounded-2xl border p-4 pb-3 text-right ${
        isOffer ? 'bg-[#f6f6ff] border-[#d6d7f9]' : 'bg-[#f3faf4] border-[#bfe0c2]'
      }`}
    >
      <span className="absolute top-3 left-3 text-[11px] text-stone-400 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200">
        לדוגמה
      </span>

      <div className="text-xs text-stone-400 mb-1">{example.category}</div>
      <h3 className="text-lg font-semibold leading-snug mb-2">
        {example.emoji} {example.title}
      </h3>

      <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
        {example.rewardLabel === 'ללא תמורה' ? (
          <span className="text-stone-400">ללא תמורה</span>
        ) : (
          <span className="text-amber-700 font-medium">💰 {example.rewardLabel}</span>
        )}
        <span className="text-stone-300">•</span>
        <span>{example.subtitle}</span>
      </div>

      <Link
        href={`/new?type=${example.type}&category=${encodeURIComponent(example.category)}&title=${encodeURIComponent(example.title)}`}
        className={`inline-block text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition-transform ${
          isOffer ? 'bg-[#5c6bc0] text-white' : 'bg-[#1b5e20] text-white'
        }`}
      >
        גם אני רוצה
      </Link>
    </div>
  )
}
