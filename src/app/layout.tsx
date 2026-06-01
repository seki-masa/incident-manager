import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: '日本ハザードマネージャー',
  description: '日本全国のハザード情報を一元管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-900 text-white h-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}
