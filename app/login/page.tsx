'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout, field, primary } from '@/components/auth-layout'
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try { const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await r.json(); if (!r.ok) { setError(data.error || '로그인할 수 없어요.'); return } router.replace('/'); router.refresh() } catch { setError('연결을 확인하고 다시 시도해주세요.') } finally { setBusy(false) }
  }
  return <AuthLayout title="다시 만나서 반가워요" subtitle="관리자 승인을 받은 계정으로 로그인해주세요."><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">이메일<input className={`mt-2 ${field}`} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"/></label><label className="block text-sm font-semibold">비밀번호<input className={`mt-2 ${field}`} type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호"/></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className={primary} disabled={busy}>{busy ? '확인 중...' : '로그인'}</button></form><p className="mt-6 text-center text-sm text-[#6b7684]">아직 계정이 없나요? <Link href="/signup" className="font-bold text-[#2fa36e]">가입 신청하기</Link></p></AuthLayout>
}
