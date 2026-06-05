'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  onSuccess: (phone: string) => void
  onClose: () => void
}

export default function PhoneAuthModal({ onSuccess, onClose }: Props) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOtp() {
    setError('')
    if (!phone.trim()) { setError('יש להזין מספר טלפון'); return }
    setLoading(true)
    const formatted = phone.startsWith('0')
      ? '+972' + phone.slice(1).replace(/-/g, '')
      : phone.replace(/-/g, '')
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)
    if (error) { setError('שגיאה בשליחת הקוד. נסי שוב.'); return }
    setStep('otp')
  }

  async function verifyOtp() {
    setError('')
    if (!otp.trim()) { setError('יש להזין את הקוד'); return }
    setLoading(true)
    const formatted = phone.startsWith('0')
      ? '+972' + phone.slice(1).replace(/-/g, '')
      : phone.replace(/-/g, '')
    const { error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms'
    })
    setLoading(false)
    if (error) { setError('קוד שגוי. נסי שוב.'); return }
    onSuccess(formatted)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
      <div className="bg-[#faf9f7] w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-stone-900">
            {step === 'phone' ? 'אימות מספר טלפון' : 'הזיני את הקוד'}
          </h2>
          <button onClick={onClose} className="text-stone-400 text-xl">✕</button>
        </div>

        {step === 'phone' ? (
          <>
            <p className="text-sm text-stone-500 mb-4 leading-relaxed">
              נשלח לך קוד אימות ב-SMS
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-0000000"
              dir="ltr"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base mb-4 outline-none focus:border-[#1b5e20]"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-[#1b5e20] text-white font-bold py-4 rounded-full disabled:opacity-60"
            >
              {loading ? 'שולח...' : 'שלח קוד'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-500 mb-4 leading-relaxed">
              שלחנו קוד ל-{phone}
            </p>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              dir="ltr"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base mb-4 outline-none focus:border-[#1b5e20] text-center text-2xl tracking-widest"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-[#1b5e20] text-white font-bold py-4 rounded-full disabled:opacity-60"
            >
              {loading ? 'מאמת...' : 'אימות'}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-stone-400 text-sm mt-3"
            >
              שלח שוב
            </button>
          </>
        )}

      </div>
    </div>
  )
}