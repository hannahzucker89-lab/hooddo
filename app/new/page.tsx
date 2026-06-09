'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, CATEGORIES } from '@/lib/supabase'
import { isValidIsraeliPhone, normalizeIsraeliPhone } from '@/utils/phone'
import { getSavedName, saveName, getSavedPhone, savePhone } from '@/utils/storage'
import dynamic from 'next/dynamic'
import PhoneAuthModal from '@/components/PhoneAuthModal'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

type TimeOption = 'מיידי' | 'השבוע' | 'גמיש'
type ItemType = 'task' | 'offer'

async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const full = `${address}, ${city}`
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(full)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.lat || !data.lng) return null
    return { lat: data.lat, lng: data.lng }
  } catch {
    return null
  }
}


function NewTaskForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const typeParam = searchParams.get('type')
  const initialType: ItemType = typeParam === 'offer' ? 'offer' : 'task'

  const [itemType, setItemType] = useState<ItemType>(initialType)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
  const [timeOption, setTimeOption] = useState<TimeOption>('השבוע')
const [exactDate, setExactDate] = useState('')
  const [duration, setDuration] = useState('')
  const [reward, setReward] = useState(25)

  // ── Location state — all together ──
  const [locationMode, setLocationMode] = useState<'gps' | 'map' | 'address'>('map')
  const [addressText, setAddressText] = useState('')
  const [city] = useState('תל אביב') // TODO: make editable in future version
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submitCooldown = useRef(false)
const [showAuth, setShowAuth] = useState(false)

  const isTask = itemType === 'task'

  useEffect(() => {
    setName(getSavedName())
    setPhone(getSavedPhone())
    const idea = searchParams.get('idea')
    if (idea) setTitle(idea)
  }, [searchParams])

  useEffect(() => { setCategory('') }, [itemType])

  // Auto-request GPS when mode switches to gps
  useEffect(() => {
    if (locationMode === 'gps' && !gpsCoords) {
      requestGPS()
    }
  }, [locationMode]) // eslint-disable-line react-hooks/exhaustive-deps

  async function requestGPS() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setAddressText('')
        setGpsLoading(false)
      },
      () => { setGpsLoading(false) },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }

  async function handleSubmit() {
    if (submitCooldown.current || submitting) return
    setError('')
const { data: { user } } = await supabase.auth.getUser()
if (!user) { setShowAuth(true); return }

if (!category) { setError('יש לבחור קטגוריה לפני פרסום'); return }
    if (title.trim().length < 5) { setError('יש לתאר את הפריט (לפחות 5 תווים)'); return }
    if (title.trim().length > 120) { setError('תיאור ארוך מדי (עד 120 תווים)'); return }

    let dur = 0
    if (isTask) {
      dur = parseInt(duration)
      if (!duration || isNaN(dur) || dur < 5 || dur > 120) {
        setError('יש להזין משך זמן (5–120 דקות)')
        return
      }
    }

    if (!name.trim()) { setError('יש להזין שם או כינוי'); return }
    if (!gpsCoords && !mapCoords && !addressText.trim()) {
      setError('כדי שהשכנים הקרובים יוכלו למצוא את הפריט, יש לבחור מיקום')
      return
    }

    saveName(name.trim())

    setSubmitting(true)
    submitCooldown.current = true
    setTimeout(() => { submitCooldown.current = false }, 10000)

    let finalCoords = gpsCoords ?? mapCoords

    if (!finalCoords && addressText.trim()) {
      setGeocoding(true)
      finalCoords = await geocodeAddress(addressText.trim(), city)
      setGeocoding(false)

      if (!finalCoords) {
        setError('לא הצלחנו למצוא את הכתובת — נסי לכתוב אותה בצורה מלאה יותר, לדוגמה: רוטשילד 22, תל אביב')
        setSubmitting(false)
        return
      }
    }

    const payload = {
  type: itemType,
  category: category || null,
  title: title.trim(),
  description: description.trim() || null,
  time_option: timeOption,
  duration_minutes: isTask ? dur : 0,
  reward_ils: reward,
  display_name: name.trim(),
  phone: user.phone ?? normalizeIsraeliPhone(phone),
  location_source: gpsCoords ? 'gps' : 'manual',
  address_text: null,
  lat: finalCoords?.lat ?? null,
  lng: finalCoords?.lng ?? null,
  is_active: true,
user_id: user.id,
  edit_token: crypto.randomUUID(),
}

    console.log('[HoodDo] insert payload:', payload)

    const { data, error: dbError } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()

   if (dbError || !data) {
  console.error('[HoodDo] Supabase error:', dbError)
  if (!finalCoords) {
    setError('יש לבחור מיקום לפני פרסום')
  } else if (dbError?.code === '42501') {
    setError('אירעה בעיית הרשאה. נסו להתנתק ולהתחבר מחדש.')
  } else if (dbError?.message?.includes('phone')) {
    setError('מספר הטלפון אינו תקין')
  } else if (dbError?.code === 'PGRST') {
    setError('אירעה בעיית חיבור, נסו שוב')
  } else {
    setError(`שגיאה בפרסום: ${dbError?.message ?? 'אנא נסו שוב'}`)
  }
  setSubmitting(false)
  return
}

    localStorage.setItem(`hooddo_token_${data.id}`, data.edit_token)
router.push(`/task/${data.id}?new=1`)
  }

  const categories = CATEGORIES[itemType]
  const rewardLabel = reward === 0 ? 'ללא תמורה' : `${reward} ₪`
  const isLoading = submitting || geocoding

  return (
    <main className="max-w-md mx-auto px-4 pb-12">

      <div className="pt-6 pb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-stone-400 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-extrabold text-stone-900">
          {isTask ? 'במה אפשר לעזור לך?' : 'מה יש לך להציע?'}
        </h1>
      </div>

      <div className="space-y-5">

       

        {/* ── Category ── */}
        <Field label="יש לבחור תחום">
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

        {/* ── Title ── */}
        <Field label={isTask ? 'כותרת הבקשה' : 'כותרת ההצעה'}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isTask
                ? 'טיול עם הכלב, השקיית עציצים...'
                : category ? `מציע/ה עזרה ב${category}` : 'מציע/ה עזרה ב...'
            }
            maxLength={80}
            className="input"
          />
<div className="text-xs text-stone-400 mt-1">זה מה שיופיע במסך הבית</div>
          <div className="text-xs text-stone-400 mt-1 text-left">{title.length}/80</div>
        </Field>

        <Field label={isTask ? 'מומלץ להוסיף עוד פרטים שיעזרו לשכנים להבין' : 'מומלץ להוסיף כמה מילים שיעזרו לשכנים להבין'}>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder={
      isTask
        ? 'פרטים נוספים שיעזרו לשכנים להבין במה מדובר...'
        : 'כמה מילים על מה שאת/ה מציע/ה...'
    }
    maxLength={400}
    rows={3}
    className="input resize-none"
  />
  <div className="text-xs text-stone-400 mt-1 text-left">{description.length}/400</div>
</Field>

        {/* ── Time — tasks only ── */}
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
        onClick={() => setExactDate(new Date().toISOString().split('T')[0])}
        className={`flex-1 py-3 rounded-full text-sm font-semibold border transition-colors ${
          exactDate
            ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
            : 'bg-white text-stone-600 border-stone-200'
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
    {/* מיקרוקופי */}
    <p className="text-xs text-stone-400 mt-2">
      {exactDate
        ? 'הבקשה תישאר באוויר עד סוף היום שנבחר'
        : timeOption === 'מיידי'
        ? 'הבקשה תישאר באוויר ל־48 שעות'
        : timeOption === 'השבוע'
        ? 'הבקשה תישאר באוויר למשך שבוע'
        : ''}
    </p>
  </Field>
)}

        {/* ── Duration — tasks only ── */}
{isTask && (
  <Field label="כמה זמן בערך?">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-stone-400">דקות בודדות</span>
      <span className="text-sm font-semibold text-stone-700">
        {duration ? (Number(duration) >= 60
          ? `${Math.floor(Number(duration) / 60)}:${String(Number(duration) % 60).padStart(2, '0')} שעות`
          : `${duration} דקות`)
          : 'בחר משך'}
      </span>
      <span className="text-xs text-stone-400">כמה שעות</span>
    </div>
    <input
      type="range"
      min={5}
      max={240}
      step={5}
      value={duration || 30}
      onChange={(e) => setDuration(e.target.value)}
      className="w-full"
      style={{ direction: 'ltr', accentColor: isTask ? '#1b5e20' : '#5c6bc0' }}
    />
  </Field>
)}
        {/* ── Reward ── */}
        <Field label="תמורה">
          <input
            type="range"
            min={0}
            max={200}
            step={5}
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="w-full accent-[#1b5e20]"
            dir="ltr"
          />
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>200 ₪</span>
            <span>ללא תמורה</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-400 shrink-0">סכום אחר:</span>
            <input
              type="number"
              min={0}
              max={9999}
              value={reward === 0 ? '' : reward}
              onChange={(e) => setReward(Number(e.target.value) || 0)}
              placeholder="הקלד סכום"
              className="input py-2 text-sm"
            />
            <span className="text-xs text-stone-400 shrink-0">₪</span>
          </div>
        </Field>

        {/* ── Location ── */}
        <Field label="מיקום הבקשה / ההצעה">
  <p className="text-sm text-stone-500 mb-3 leading-relaxed">
    📍 המיקום שתבחרו כאן משמש לחישוב המרחק עבור שכנים אחרים.<br />
    הכתובת המדויקת לא תוצג - רק המרחק.
  </p>

          {/* ── בחירת שיטה ── */}
          <div className="flex gap-2 mb-3">
            {(['address', 'map', 'gps'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLocationMode(mode)}
                className={`flex-1 py-2 rounded-full text-xs font-bold border transition-colors ${
                  locationMode === mode
                    ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {mode === 'gps' ? '📍 GPS' : mode === 'map' ? '🗺️ מפה' : '⌨️ כתובת'}
              </button>
            ))}
          </div>

          {/* ── GPS ── */}
          {locationMode === 'gps' && (
            gpsCoords ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <span className="text-sm text-green-700 font-medium">📍 מיקום זוהה</span>
                <button type="button" onClick={() => setGpsCoords(null)} className="text-xs text-stone-400 underline">
                  הסר
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={requestGPS}
                disabled={gpsLoading}
                className="w-full border border-stone-200 bg-white rounded-xl py-3 text-sm text-stone-600 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
              >
                {gpsLoading ? <span className="animate-pulse">מאתר מיקום...</span> : <>📍 השתמש במיקומי הנוכחי</>}
              </button>
            )
          )}

          {/* ── מפה ── */}
          {locationMode === 'map' && (
            <LocationPicker
              selected={mapCoords}
              onSelect={(coords) => setMapCoords(coords)}
            />
          )}

          {/* ── כתובת ── */}
          {locationMode === 'address' && (
            <input
              type="text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="לדוגמה: רוטשילד 22, תל אביב"
              className="input"
            />
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !category}
          className={`w-full text-white font-bold text-lg py-4 rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-60 ${
  isTask ? 'bg-[#1b5e20]' : 'bg-[#5c6bc0]'
}`}
        >
          {geocoding
            ? 'מאמת כתובת...'
            : submitting
            ? 'שולח...'
            : isTask
? 'שליחת בקשה לשכונה'
: 'שליחת הצעה לשכונה'}
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
{showAuth && (
  <PhoneAuthModal
    onSuccess={(verifiedPhone) => { 
  setPhone(verifiedPhone)
  setShowAuth(false)
  handleSubmit() 
}}
    onClose={() => setShowAuth(false)}
  />
)}
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
export default function NewTaskPage() {
  return (
    <Suspense>
      <NewTaskForm />
    </Suspense>
  )
}
