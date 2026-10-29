import type { ReactNode } from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="flex min-h-dvh items-center justify-center bg-[#f5f7fa] px-5 py-12 text-[#191f28]"><div className="w-full max-w-[440px]"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-xl font-extrabold tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2fa36e] text-white"><Leaf size={21}/></span>freshkeep<span className="text-[#2fa36e]">.</span></Link><div className="rounded-[28px] bg-white p-6 shadow-[0_16px_50px_rgba(25,31,40,0.04)] sm:p-9"><h1 className="text-[27px] font-bold tracking-[-0.04em]">{title}</h1><p className="mb-7 mt-2 text-[14px] leading-6 text-[#6b7684]">{subtitle}</p>{children}</div><p className="mt-6 text-center text-xs leading-5 text-[#8b95a1]">가족의 식재료를 안전하게 함께 관리해요.</p></div></main>
}
export const field = 'h-12 w-full rounded-xl border border-[#e5e8eb] bg-white px-4 text-base outline-none focus:border-[#2fa36e] focus:ring-2 focus:ring-[#2fa36e]/10'
export const primary = 'flex h-12 w-full items-center justify-center rounded-xl bg-[#2fa36e] px-5 text-[15px] font-bold text-white transition hover:bg-[#1f7d56] disabled:opacity-50'
