'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, CATEGORIES, itemType, type Task } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import { getMyCorner, type Corner } from '@/utils/corner'
import { logEvent } from '@/utils/analytics'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

type TimeOption = 'מיידי' | 'השבוע' | 'גמיש'

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [notFoundOrNotOwner, setNotFoundOrNotOwner] = useState(false)
  const [task, setTask] = useState<Task | null>(null)

  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeOption, setTimeOption] = useState<TimeOption>('גמיש')
  const [exactDate, setExactDate] = useState('')
  const [duration, setDuration] = useState('20')
  const [reward, setReward] = useState<number | null>(null)
  const [customReward, setCustomReward] = useState('')

  const [myCorner, setMyCornerState] = useState<Corner | null>(null)
  const [useOtherLocation, setUseOtherLocation] = useState(false)
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const submitCooldown = useRef(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (!data || !user || user.id !== data.user_id) {
        setNotFoundOrNotOwner(true)
        setLoading(false)
        return
      }

      const t = data as Task
      setTask(t)
      setCategory(t.category ?? '')
      setTitle(t.title)
      setDescription(t.description ?? '')
      setTimeOption((t.time_option as TimeOption) ?? 'גמיש')
      setExactDate(t.exact_date ?? '')
      setDuration(t.duration_minutes === 0 ? 'unknown' : String(t.duration_minutes || 20))
      setReward(t.reward_ils)
      if (t.lat && t.lng) setMapCoords({ lat: t.lat, lng: t.lng })

      const corner = await getMyCorner()
      setMyCornerState(corner)
      // אם המיקום השמור שונה מהפינה — נציג כברירת מחדל את המיקום של הפרסום עצמו
      if (corner && t.lat === corner.lat && t.lng === corner.lng) {
        setUseOtherLocation(false)
      } else {
        setUseOtherLocation(true)
      }

      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    if (submitCooldown.current || saving || !task) return
    setError('')

    if (title.trim().length < 5) { setError('יש למלא כותרת (לפחות 5 תווים)'); return }
    if (title.trim().length > 120) { setError('כותרת ארוכה מדי (עד 120 תווים)'); return }
    if (reward === null) { setError('יש לבחור תמורה'); return }

    const isTask = itemType(task) === 'task'
    let dur = 0
    if (isTask) dur = duration === 'unknown' ? 0 : parseInt(duration || '20')

    const usingCorner = myCorner && !useOtherLocation
    const finalCoords = usingCorner ? myCorner : mapCoords
    if (!finalCoords) { setError('יש לבחור מיקום'); return }

    setSaving(true)
    submitCooldown.current = true
    setTimeout(() => { submitCooldown.current = false }, 10000)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('יש להתחבר מחדש'); setSaving(false); return }

    const { error: dbError } = await supabase
      .from('tasks')
      .update({
        category: category || null,
        title: title.trim(),
        description: description.trim() || null,
        time_option: timeOption,
        exact_date: exactDate || null,
        duration_minutes: isTask ? dur : 0,
        reward_ils: reward === -1 ? (Number(customReward) || 0) : (reward ?? 0),
        lat: finalCoords.lat,
        lng: finalCoords.lng,
        location_source: usingCorner ? 'corner' : 'manual',
      })
      .eq('id', task.id)
      .eq('user_id', user.id)

    if (dbError) {
      setError(`שגיאה בשמירה: ${dbError.message ?? 'אנא נסו שוב'}`)
      setSaving(false)
      return
    }

    logEvent('publication_edited', {
      publication_id: task.id,
      publication_type: itemType(task) === 'offer' ? 'offer' : 'request',
      category: category || undefined,
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => router.replace(`/task/${task.id}`), 1200)
  }

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-10">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-stone-100" />
          ))}
        </div>
      </main>
    )
  }

  if (notFoundOrNotOwner || !task) {
    return (
      <main className="max-w-md mx-auto px-4 pt-16 text-center">
        <p className="text-stone-500">אין לך הרשאה לערוך פרסום זה</p>
        <button onClick={() => router.push(`/task/${id}`)} className="mt-4 text-[#1b5e20] underline text-sm">
          חזרה לפרטי הפרסום
        </button>
      </main>
    )
  }

  const isTask = itemType(task) === 'task'
  const categories = CATEGORIES[itemType(task)]

  return (
    <main className="max-w-md mx-auto px-4 pb-12">

      <div className="pt-6 pb-5 flex items-center gap-3">
        <button onClick={() => router.replace(`/task/${task.id}`)} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-extrabold text-stone-900">
          עריכת {isTask ? 'הבקשה' : 'ההצעה'}
        </h1>
      </div>

      <div className="space-y-5">

        <Field label="תחום">
          <div className="flex flex-wrap gap-2">
            {categories.map(({ emoji, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setCategory(label === category ? '' : label)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  category === label
                    ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={isTask ? 'כותרת הבקשה' : 'כותרת ההצעה'}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="input"
          />
          <div className="text-xs text-stone-400 mt-1 text-left">{title.length}/80</div>
        </Field>

        <Field label="פרטים נוספים">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={400}
            rows={3}
            className="input resize-none"
          />
          <div className="text-xs text-stone-400 mt-1 text-left">{description.length}/400</div>
        </Field>

        {isTask && (
          <Field label="מתי?">
            <div className="flex gap-2 flex-wrap">
              {(['מיידי', 'השבוע', 'גמיש'] as TimeOption[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setTimeOption(opt); setExactDate('') }}
                  className={`flex-1 py-3 rounded-full text-sm font-semibold border transition-colors ${
                    timeOption === opt && !exactDate
                      ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setExactDate(exactDate || new Date().toISOString().split('T')[0])}
                className={`flex-1 py-3 rounded-full text-sm font-semibold border transition-colors ${
                  exactDate ? 'bg-[#1b5e20] text-white border-[#1b5e20]' : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                📅 תאריך
              </button>
            </div>
            {exactDate && (
              <input
                type="date"
                value={exactDate}
                onChange={(e) => setExactDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input mt-2"
                dir="ltr"
              />
            )}
          </Field>
        )}

        {isTask && (
          <Field label="כמה זמן בערך?">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'עד 30 דקות', value: '20' },
                { label: '30–60 דקות', value: '45' },
                { label: 'שעה–שעתיים', value: '90' },
                { label: 'יותר משעתיים', value: '150' },
                { label: 'לא ידוע עדיין', value: 'unknown' },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDuration(value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    duration === value
                      ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="תמורה">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'ללא תמורה', value: 0 },
              { label: '20 ₪', value: 20 },
              { label: '40 ₪', value: 40 },
              { label: '60 ₪', value: 60 },
              { label: '80 ₪', value: 80 },
              { label: 'אחר', value: -1 },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setReward(value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  reward === value
                    ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {reward === -1 && (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min={0}
                max={9999}
                value={customReward}
                onChange={(e) => setCustomReward(e.target.value)}
                placeholder="הזינו סכום"
                className="input py-2 text-sm"
              />
              <span className="text-sm text-stone-400 shrink-0">₪</span>
            </div>
          )}
        </Field>

        <Field label="מיקום">
          {myCorner && !useOtherLocation ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div>
                <div className="text-sm text-green-700 font-bold">📍 הפינה שלי</div>
                <div className="text-xs text-green-600 mt-0.5">{myCorner.label || 'המיקום שנבחר'}</div>
              </div>
              <button type="button" onClick={() => setUseOtherLocation(true)} className="text-xs text-stone-500 underline">
                שינוי
              </button>
            </div>
          ) : (
            <>
              {myCorner && (
                <button type="button" onClick={() => setUseOtherLocation(false)} className="text-xs text-stone-500 underline mb-2">
                  ← חזרה לפינה שלי
                </button>
              )}
              <LocationPicker selected={mapCoords} onSelect={(coords) => setMapCoords(coords)} />
            </>
          )}
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className={`w-full text-white font-bold text-lg py-4 rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-60 ${
            isTask ? 'bg-[#1b5e20]' : 'bg-[#5c6bc0]'
          }`}
        >
          {saved ? '✓ נשמר' : saving ? 'שומר...' : 'שמירת שינויים'}
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
