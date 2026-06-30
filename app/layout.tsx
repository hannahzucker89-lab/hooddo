'use client'

import { useEffect, useState } from 'react'
import Onboarding, { useOnboardingDone } from '@/components/Onboarding'
import { logEvent } from '@/utils/analytics'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check after mount (client-only)
    const done = useOnboardingDone()
    setShowOnboarding(!done)
    setReady(true)
    logEvent('app_open')
  }, [])

  return (
    <html lang="he" dir="rtl">
      <head>
        <title>HoodDo – אנשים קרובים. אפשרויות חדשות.</title>
        <meta name="description" content="HoodDo – פרסמו בקשה או הצעה לשכנים בסביבה. מיקום משוער בלבד, ללא חשיפת כתובת." />
        <meta property="og:title" content="HoodDo – אנשים קרובים. אפשרויות חדשות." />
        <meta property="og:description" content="פרסמו בקשה או הצעה לשכנים בסביבה. מיקום משוער בלבד, ללא חשיפת כתובת." />
        <meta property="og:site_name" content="HoodDo" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="HoodDo – אנשים קרובים. אפשרויות חדשות." />
      </head>
      <body className="min-h-screen bg-[#f9f7f4]">
        {ready && showOnboarding ? (
          <Onboarding onComplete={() => { logEvent('onboarding_completed'); setShowOnboarding(false) }} />
        ) : (
          children
        )}
      </body>
    </html>
  )
}
