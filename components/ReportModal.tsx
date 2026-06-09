'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

export default function ReportModal({ onClose }: Props) {
  const [type, setType] = useState('')
  const [details, setDetails] = useState('')

  function handleSend() {
    const subject = encodeURIComponent(`דיווח HoodDo: ${type}`)
    const body = encodeURIComponent(`סוג: ${type}\n\nפרטים:\n${details}`)
    window.open(`mailto:hooddoapp@gmail.com?subject=${subject}&body=${body}`)
    onClose()
  }

  const types = ['דיווח על תקלה', 'רעיון לשיפור', 'תוכן לא הולם']

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
      <div className="bg-[#faf9f7] w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-stone-900">דיווח על בעיה</h2>
          <button onClick={onClose} className="text-stone-400 text-xl">✕</button>
        </div>

        <div className="space-y-3 mb-5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="פרטים נוספים (אופציונלי)"
          rows={3}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#1b5e20] resize-none"
          dir="rtl"
        />

        <button
          onClick={handleSend}
          disabled={!type}
          className="w-full bg-[#1b5e20] text-white font-bold py-4 rounded-full disabled:opacity-40"
        >
          שליחה
        </button>
      </div>
    </div>
  )
}
