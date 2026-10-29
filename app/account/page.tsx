'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout, field, primary } from '@/components/auth-layout'
export default function AccountPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState(''), [newPassword, setNewPassword] = useState(''), [confirm, setConfirm] = useState(''), [error, setError] = useState(''), [done, setDone] = useState(false), [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    if (newPassword !== confirm) { setError('새 비밀번호가 서로 달라요.'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/auth/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
      const data = await r.json()
      if (!r.ok) { setError(data.error || '변경하지 못했어요.'); return }
      setDone(true); setCurrentPassword(''); setNewPassword(''); setConfirm('')
    } catch { setError('연결을 확인해주세요.') } finally { setBusy(false) }
  }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/login'); router.refresh() }
  return <AuthLayout title="비밀번호 변경" subtitle="현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿔요. 변경하면 다른 기기의 로그인은 모두 풀려요.">
    {done ? <div className="space-y-4"><div className="rounded-2xl bg-[#e7f6ee] p-5 text-sm leading-6 text-[#1f7d56]">비밀번호를 변경했어요. 이 기기는 계속 로그인돼 있고, 다른 기기는 다시 로그인해야 해요.</div><Link href="/" className={primary}>냉장고로 돌아가기</Link></div> : <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold">현재 비밀번호<input className={`mt-2 ${field}`} type="password" autoComplete="current-password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}/></label>
      <label className="block text-sm font-semibold">새 비밀번호 <span className="font-normal text-[#8b95a1]">(12자 이상)</span><input className={`mt-2 ${field}`} type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={e => setNewPassword(e.target.value)}/></label>
      <label className="block text-sm font-semibold">새 비밀번호 확인<input className={`mt-2 ${field}`} type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}/></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className={primary} disabled={busy}>{busy ? '변경하는 중...' : '비밀번호 변경'}</button>
    </form>}
    <div className="mt-7 flex justify-between text-sm"><Link href="/" className="text-[#2fa36e]">냉장고로 돌아가기</Link><button onClick={() => void logout()} className="text-[#6b7684]">로그아웃</button></div>
  </AuthLayout>
}
