'use client'
import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout, field, primary } from '@/components/auth-layout'
type Me = { user: { name: string; householdId: string | null }; joinRequest: { id: string } | null }
export default function Onboarding() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null), [name, setName] = useState(''), [code, setCode] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  async function load() { const r = await fetch('/api/auth/me', { cache: 'no-store' }); if (r.status === 401) { router.replace('/login'); return } if (!r.ok) { setError('상태를 불러오지 못했어요.'); return } const data: Me = await r.json(); if (data.user.householdId) { router.replace('/'); router.refresh() } else setMe(data) }
  useEffect(() => { const timer = setTimeout(() => { void load() }, 0); return () => clearTimeout(timer) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  async function call(url: string, body?: object) {
    setBusy(true); setError('')
    try { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); const data = await r.json(); if (!r.ok) { setError(data.error || '다시 시도해주세요.'); return } await load() } catch { setError('연결을 확인해주세요.') } finally { setBusy(false) }
  }
  async function logout() { await call('/api/auth/logout'); router.replace('/login'); router.refresh() }
  return <AuthLayout title={me ? `${me.user.name}님, 가족 냉장고를 시작해요` : '계정 확인 중'} subtitle="관리자 승인 후에는 가족 그룹을 만들거나 초대코드로 합류할 수 있어요.">{!me ? <p role="status">불러오는 중...</p> : me.joinRequest ? <div className="space-y-4"><div className="rounded-2xl bg-[#edf4ff] p-5 text-sm leading-6 text-[#1b64da]">가족 구성원의 승인을 기다리고 있어요. 승인 후 이 페이지를 새로고침하면 공동 냉장고로 이동해요.</div>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button className={primary} onClick={() => void load()}>승인 상태 확인</button><button className="h-11 w-full text-sm text-[#6b7684]" onClick={() => void call(`/api/households/requests/${me.joinRequest!.id}`, { action: 'CANCEL' })}>신청 취소</button></div> : <div className="space-y-7"><form onSubmit={(e: FormEvent) => { e.preventDefault(); void call('/api/households', { name }) }}><h2 className="mb-2 font-bold">새 가족 그룹 만들기</h2><p className="mb-3 text-sm text-[#8b95a1]">그룹을 만들면 내가 첫 구성원이 돼요.</p><input aria-label="가족 그룹 이름" className={field} minLength={2} maxLength={60} required placeholder="예: 우리 가족" value={name} onChange={e => setName(e.target.value)}/><button className={`${primary} mt-3`} disabled={busy}>가족 만들기</button></form><div className="relative text-center text-xs text-[#8b95a1]">또는</div><form onSubmit={(e: FormEvent) => { e.preventDefault(); void call('/api/households/join', { code: code.trim() }) }}><h2 className="mb-2 font-bold">기존 가족에 합류하기</h2><p className="mb-3 text-sm text-[#8b95a1]">구성원에게 받은 코드를 입력하고 승인을 기다려요.</p><input aria-label="초대코드" className={field} required placeholder="초대코드 입력" value={code} onChange={e => setCode(e.target.value)}/><button className={`${primary} mt-3`} disabled={busy}>합류 신청</button></form>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div>}<div className="mt-7 flex justify-between text-sm"><Link href="/" className="text-[#3182f6]">홈으로</Link><button onClick={() => void logout()} className="text-[#6b7684]">로그아웃</button></div></AuthLayout>
}
