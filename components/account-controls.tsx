'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
export function AccountControls() {
  const router = useRouter()
  const [account, setAccount] = useState<{name:string; role:string; household:string}|null>(null)
  useEffect(() => { const timer = setTimeout(() => { void fetch('/api/auth/me', { cache: 'no-store' }).then(r => r.json()).then(data => { if (data.user) setAccount({ name: data.user.name, role: data.user.role, household: data.household?.name || '' }) }).catch(() => {}) }, 0); return () => clearTimeout(timer) }, [])
  async function logout() { const r = await fetch('/api/auth/logout', { method: 'POST' }); if (r.ok) { router.replace('/login'); router.refresh() } }
  return <div className="flex items-center gap-2 text-xs font-semibold"><Link className="max-w-[110px] truncate rounded-xl bg-[#e7f6ee] px-3 py-3 text-[#2fa36e] sm:max-w-none" href="/family" title="가족 관리">{account?.household || '가족 관리'}</Link>{account?.role === 'ADMIN' && <Link href="/admin" className="hidden rounded-xl px-2 py-3 text-[#6b7684] sm:block">가입 승인</Link>}<button type="button" onClick={() => void logout()} className="h-11 rounded-xl px-2 text-[#6b7684]">로그아웃</button></div>
}
