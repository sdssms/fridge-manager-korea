'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout, primary } from '@/components/auth-layout'
type RequestRow = { id: string; name: string; email: string; createdAt: string }
export default function AdminPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<RequestRow[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(''), [loading, setLoading] = useState(true)
  async function load() { try { const r = await fetch('/api/admin/requests', { cache: 'no-store' }); if (r.status === 401) { router.replace('/login'); return } if (r.status === 403) { router.replace('/'); return } if (!r.ok) throw Error(); setRequests(await r.json()) } catch { setError('가입 신청을 불러오지 못했어요.') } finally { setLoading(false) } }
  useEffect(() => { const timer = setTimeout(() => { void load() }, 0); return () => clearTimeout(timer) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(id: string, action: 'APPROVE' | 'REJECT') { setBusy(id); setError(''); try { const r = await fetch(`/api/admin/requests/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); if (!r.ok) { const body = await r.json(); setError(body.error || '처리하지 못했어요.'); return } await load() } catch { setError('연결을 확인해주세요.') } finally { setBusy('') } }
  return <AuthLayout title="가입 신청 관리" subtitle="관리자 승인이 끝난 뒤 회원이 가족 그룹을 만들거나 합류할 수 있어요."><div className="space-y-3">{loading && <p role="status" className="text-sm">신청을 불러오는 중...</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{!loading && !requests.length && <p className="rounded-xl bg-[#f5f7fa] p-5 text-center text-sm text-[#6b7684]">대기 중인 가입 신청이 없어요.</p>}{requests.map(row => <section key={row.id} className="rounded-2xl border border-[#eef0f3] p-4"><strong className="block text-[16px]">{row.name}</strong><p className="mt-1 text-sm text-[#6b7684]">{row.email}</p><p className="mt-1 text-xs text-[#8b95a1]">신청: {new Date(row.createdAt).toLocaleDateString('ko-KR')}</p><div className="mt-4 flex gap-2"><button className={`${primary} flex-1`} disabled={!!busy} onClick={() => void decide(row.id, 'APPROVE')}>승인</button><button className="h-12 flex-1 rounded-xl border border-[#e5e8eb] text-sm font-bold" disabled={!!busy} onClick={() => void decide(row.id, 'REJECT')}>거절</button></div></section>)}</div><Link href="/" className="mt-7 inline-block text-sm font-semibold text-[#3182f6]">냉장고로 돌아가기</Link></AuthLayout>
}
