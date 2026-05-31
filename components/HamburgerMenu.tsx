'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const items = [
    { label: 'איך זה עובד', icon: '💡', href: '/how-it-works' },
    { label: 'אודות', icon: '🏘️', href: '/about' },
    { label: 'פרטיות ותקנון', icon: '🔒', href: '/privacy' },
    { label: 'יצירת קשר', icon: '✉️', href: '/contact' },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="תפריט"
        className="w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-full bg-white border border-stone-200 shadow-sm active:scale-95 transition-transform"
      >
        <span className="w-4 h-px bg-stone-600 block" />
        <span className="w-4 h-px bg-stone-600 block" />
        <span className="w-3 h-px bg-stone-600 block" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#faf9f7] z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-12 pb-6 px-6">
          {/* Logo area */}
          <div className="mb-8">
            <div className="text-xl font-extrabold text-stone-900 tracking-tight">HoodDo</div>
            <div className="text-xs text-stone-400 mt-0.5">השכונה שלך, קרוב יותר</div>
          </div>

          {/* Menu items */}
          <nav className="space-y-1">
            {items.map(({ label, icon, href }) => (
              <button
                key={label}
                onClick={() => { setOpen(false); router.push(href) }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-right hover:bg-stone-100 active:bg-stone-200 transition-colors group"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600 text-xl"
          aria-label="סגור תפריט"
        >
          ✕
        </button>

        {/* Footer */}
        <div className="absolute bottom-6 right-6 left-6 text-xs text-stone-300 text-center">
          HoodDo © {new Date().getFullYear()}
        </div>
      </div>
    </>
  )
}
