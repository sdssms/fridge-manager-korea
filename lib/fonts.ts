import { Geist } from 'next/font/google'

// Primary typeface per the design system (Geist). Korean glyphs fall back to
// Pretendard / system Korean fonts declared in globals.css.
export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})
