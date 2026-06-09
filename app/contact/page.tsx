'use client'

import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()

  return (
    <main className='max-w-md mx-auto px-5 pb-16' dir='rtl'>
      <div className='pt-6 pb-6 flex items-center gap-3'>
        <button onClick={() => router.back()} className='text-stone-400 text-2xl leading-none'>‹</button>
        <h1 className='text-lg font-extrabold text-stone-900'>יצירת קשר</h1>
      </div>
      <div className='space-y-6'>
        <p className='text-stone-600 leading-relaxed'>יש לכם מחשבה, שאלה או רעיון?</p>
        <p className='text-stone-500 leading-relaxed'>אנחנו תמיד שמחים לשמוע.</p>
        <div className='h-px bg-stone-100' />
        <div className='space-y-3'>
          <p className='text-sm text-stone-400'>hooddoapp@gmail.com</p>
          <a href='mailto:hooddoapp@gmail.com' className='flex items-center justify-center w-full bg-[#1b5e20] text-white font-bold py-4 rounded-full'>
            שליחת מייל
          </a>
        </div>
      </div>
    </main>
  )
}
