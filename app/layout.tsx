'use client'

import { useEffect, useState } from 'react'
import Onboarding, { useOnboardingDone } from '@/components/Onboarding'
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
  }, [])

  return (
    <html lang="he" dir="rtl">
      <head>
        <title>HoodDo – משימות שכונתיות</title>
        <meta name="description" content="שוק משימות שכונתי" />
      </head>
      <body className="min-h-screen bg-[#f9f7f4]">
        {ready && showOnboarding && (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        )}
        {children}
      </body>
    </html>
  )
}
