'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AuthLayout, field, primary } from '@/components/auth-layout'
export default function SignupPage() {
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [error, setError] = useState(''), [done, setDone] = useState(false), [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('비밀번호가 서로 달라요.'); return }
    setBusy(true)
    try { const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) }); const data = await r.json(); if (!r.ok) { setError(data.error || '가입 신청에 실패했어요.'); return } setDone(true) } catch { setError('연결을 확인해주세요.') } finally { setBusy(false) }
  }
  return <AuthLayout title={done ? '가입 신청을 받았어요' : '함께 시작해볼까요?'} subtitle={done ? '관리자가 계정을 승인하면 로그인할 수 있어요. 가족 그룹은 로그인 후 만들거나 합류해요.' : '가입 후 관리자 승인까지 기다려주세요. 가족 그룹은 로그인 후 선택해요.'}>{done ? <Link href="/login" className={primary}>로그인 화면으로</Link> : <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">이름<input className={`mt-2 ${field}`} minLength={2} maxLength={50} autoComplete="name" required value={name} onChange={e => setName(e.target.value)}/></label><label className="block text-sm font-semibold">이메일<input className={`mt-2 ${field}`} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/></label><label className="block text-sm font-semibold">비밀번호 <span className="font-normal text-[#8b95a1]">(12자 이상)</span><input className={`mt-2 ${field}`} type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)}/></label><label className="block text-sm font-semibold">비밀번호 확인<input className={`mt-2 ${field}`} type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}/></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className={primary} disabled={busy}>{busy ? '신청 중...' : '가입 신청'}</button></form>}<p className="mt-6 text-center text-sm text-[#6b7684]">이미 계정이 있나요? <Link href="/login" className="font-bold text-[#2fa36e]">로그인</Link></p></AuthLayout>
}
