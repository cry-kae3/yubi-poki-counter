import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '馬の指ポキ記録ツール',
  description: '馬さんの指ポキ回数を記録・分析するアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans">{children}</body>
    </html>
  )
}
