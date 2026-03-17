'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isValidIsraeliPhone, normalizeIsraeliPhone } from '@/utils/phone'
import { getSavedName, saveName, getSavedPhone, savePhone } from '@/utils/storage'

type TimeOption = 'עכשיו' | 'היום' | 'מחר'

const TASK_IDEAS = [
  { emoji: '🐶', label: 'טיול עם הכלב' },
  { emoji: '🪴', label: 'השקיית עציצים' },
  { emoji: '🧺', label: 'קיפול כביסה' },
  { emoji: '🔧', label: 'תליית מדף' },
  { emoji: '📱', label: 'עזרה עם הטלפון' },
  { emoji: '📦', label: 'סידור ארון' },
  { emoji: '🧾', label: 'עזרה בבירוקרטיה' },
]

export default function NewTaskPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [timeOption, setTimeOption] = useState<TimeOption>('היום')
  const [duration, setDuration] = useState('')
  const [reward, setReward] = useState('')
  const [rewardOther, setRewardOther] = useState(false)
  const [locationSource, setLocationSource] = useState<'gps' | 'manual'>('manual')
  const [addressText, setAddressText] = useState('')
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [savePhoneLocal, setSavePhoneLocal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const submitCooldown = useRef(false)

  useEffect(() => {
    setName(getSavedName())
    setPhone(getSavedPhone())
  }, [])

  async function requestGPS() {
    if (!navigator.geolocation) { setLocationSource('manual'); return }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationSource('gps')
        setGpsLoading(false)
      },
      () => { setLocationSource('manual'); setGpsLoading(false) }
    )
  }

  async function handleSubmit() {
    if (submitCooldown.current || submitting) return
    setError('')

    if (title.trim().length < 5) { setError('יש לתאר את המשימה (לפחות 5 תווים)'); return }
    if (title.trim().length > 120) { setError('תיאור המשימה ארוך מדי (עד 120 תווים)'); return }
    const dur = parseInt(duration)
    if (!duration || isNaN(dur) || dur < 5 || dur > 120) { setError('יש להזין משך זמן (5–120 דקות)'); return }
    const rew = reward === '' ? 0 : parseInt(reward)
    if (isNaN(rew) || rew < 0 || rew > 500) { setError('תגמול לא תקין (0–500 ₪)'); return }
    if (!name.trim()) { setError('יש להזין שם או כינוי'); return }
    if (!isValidIsraeliPhone(phone)) { setError('מספר טלפון לא תקין'); return }
    if (locationSource === 'manual' && !addressText.trim()) { setError('יש להזין כתובת'); return }

    saveName(name.trim())
    if (savePhoneLocal) savePhone(phone)

    setSubmitting(true)
    submitCooldown.current = true
    setTimeout(() => { submitCooldown.current = false }, 10000)

    const payload: {
      title: string
      time_option: string
      duration_minutes: number
      reward_ils: number
      display_name: string
      phone: string
      location_source: string
      address_text: string | null
      lat: number | null
      lng: number | null
      is_active: boolean
    } = {
      title: title.trim(),
      time_option: timeOption,
      duration_minutes: dur,
      reward_ils: rew,
      display_name: name.trim(),
      phone: normalizeIsraeliPhone(phone),
      location_source: locationSource,
      address_text: locationSource === 'manual' ? addressText.trim() : null,
      lat: locationSource === 'gps' ? gpsCoords?.lat ?? null : null,
      lng: locationSource === 'gps' ? gpsCoords?.lng ?? null : null,
      is_active: true,
    }

    console.log('[HoodDo] insert payload:', payload)

    const { data, error: dbError } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()

    if (dbError || !data) {
      console.error('[HoodDo] Supabase insert error (full object):', dbError)
      console.error('[HoodDo] error.message:', dbError?.message)
      console.error('[HoodDo] error.details:', dbError?.details)
      console.error('[HoodDo] error.hint:   ', dbError?.hint)
      console.error('[HoodDo] error.code:   ', dbError?.code)
      setError('שגיאה בפרסום המשימה. אנא נסו שוב.')
      setSubmitting(false)
      return
    }

    router.push(`/task/${data.id}?new=1`)
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-12">

      {/* ── Header ── */}
      <div className="pt-6 pb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-extrabold text-stone-900">במה אפשר לעזור?</h1>
      </div>

      <div className="space-y-5">

        {/* ── Title + suggestions ── */}
        <Field label="תיאור המשימה">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="טיול עם הכלב, השקיית עציצים, קיפול כביסה..."
            maxLength={120}
            rows={2}
            className="input resize-none"
          />
          <CharCount current={title.length} max={120} />

          {/* Idea chips */}
          <div className="mt-3">
            <p className="text-xs text-stone-400 font-semibold mb-2">רעיונות למשימות</p>
            <div className="flex flex-wrap gap-2">
              {TASK_IDEAS.map(({ emoji, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTitle(`${emoji} ${label}`)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    title === `${emoji} ${label}`
                      ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                      : 'bg-stone-100 text-stone-600 border-transparent'
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>
        </Field>

        {/* ── Time ── */}
        <Field label="מתי?">
          <div className="flex gap-2">
            {(['עכשיו', 'היום', 'מחר'] as TimeOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setTimeOption(opt)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  timeOption === opt
                    ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>

        {/* ── Duration ── */}
        <Field label="משך זמן משוער (דקות)">
          <div className="flex gap-2 mb-2">
            {[15, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(String(d))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  duration === String(d)
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {d} דק׳
              </button>
            ))}
          </div>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="או הקלד מספר אחר (5–120)"
            min={5}
            max={120}
            className="input"
          />
        </Field>

        {/* ── Reward ── */}
        <Field label="תגמול (₪)">
          <div className="flex flex-wrap gap-2 mb-2">
            {([20, 40, 60, 80] as number[]).map((r) => (
              <button
                key={r}
                onClick={() => { setReward(String(r)); setRewardOther(false) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  !rewardOther && reward === String(r)
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {r} ₪
              </button>
            ))}
            <button
              onClick={() => { setReward('0'); setRewardOther(false) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                !rewardOther && reward === '0'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              ללא
            </button>
            <button
              onClick={() => { setRewardOther(true); setReward('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                rewardOther
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              אחר
            </button>
          </div>
          {rewardOther && (
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="הזן סכום (0–500 ₪)"
              min={0}
              max={500}
              className="input"
              autoFocus
            />
          )}
        </Field>

        {/* ── Location ── */}
        <Field label="מיקום">
          {locationSource === 'gps' && gpsCoords ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-sm text-green-700 font-medium">📍 מיקום GPS נקלט</span>
              <button
                onClick={() => { setLocationSource('manual'); setGpsCoords(null) }}
                className="text-xs text-stone-400 underline"
              >
                שנה
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={requestGPS}
                disabled={gpsLoading}
                className="w-full mb-2 border border-stone-200 bg-white rounded-xl py-3 text-sm text-stone-600 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                {gpsLoading ? <span className="animate-pulse">מאתר...</span> : <>📍 השתמש במיקום שלי</>}
              </button>
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="או הקלד כתובת (לדוג׳: שדרות רוטשילד 10)"
                className="input"
              />
            </>
          )}
        </Field>

        {/* ── Name ── */}
        <Field label="שם / כינוי">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוג׳: מיכל, דני..."
            className="input"
          />
        </Field>

        {/* ── Phone ── */}
        <Field label="מספר WhatsApp">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="050-0000000"
            className="input"
            dir="ltr"
          />
          <label className="flex items-center gap-2 mt-2 text-sm text-stone-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={savePhoneLocal}
              onChange={(e) => setSavePhoneLocal(e.target.checked)}
              className="rounded"
            />
            שמור מספר למשימות הבאות
          </label>
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#1b5e20] text-white font-bold text-lg py-4 rounded-2xl shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {submitting ? 'שולח...' : '➕ פרסום משימה'}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: white;
          border: 1px solid #e5e0d8;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 15px;
          font-family: inherit;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s;
          direction: rtl;
        }
        .input:focus { border-color: #1b5e20; }
        .input::placeholder { color: #a8a29e; }
      `}</style>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <div className="text-xs text-stone-400 mt-1 text-left">{current}/{max}</div>
  )
}
