import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fresh Keep | 우리집 냉장고',
  description: '우리집 식재료를 신선하게 관리해요',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="ko" className="h-full antialiased"><body className="min-h-full">{children}</body></html>
}
