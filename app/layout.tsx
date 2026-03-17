import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HoodDo – משימות שכונתיות',
  description: 'שוק משימות שכונתי – כיכר רבין וגן דובנוב',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-[#f9f7f4]">{children}</body>
    </html>
  )
}
