'use client'
import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

type Event = {
  id: string
  itemName: string
  category: string
  quantity: number | null
  unit: string | null
  action: 'EATEN' | 'DISCARDED'
  discardReason: 'EXPIRED' | 'SPOILED' | 'TOO_MUCH' | 'OTHER' | null
  occurredAt: string
  actorName: string
}
const reasonLabel: Record<NonNullable<Event['discardReason']>, string> = { EXPIRED: '유통기한 지남', SPOILED: '맛·상태 변함', TOO_MUCH: '너무 많이 사서', OTHER: '기타' }

export function ConsumptionHistory() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  async function load() {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/consumption', { cache: 'no-store' })
      if (!response.ok) throw Error()
      const data = await response.json()
      setEvents(data.events); setCursor(data.nextCursor)
    } catch { setError('소비 이력을 불러오지 못했어요.') } finally { setLoading(false) }
  }
  useEffect(() => { const timer = setTimeout(() => { void load() }, 0); return () => clearTimeout(timer) }, [])

  async function loadMore() {
    if (!cursor) return
    setLoadingMore(true)
    try {
      const response = await fetch(`/api/consumption?cursor=${encodeURIComponent(cursor)}`, { cache: 'no-store' })
      if (!response.ok) throw Error()
      const data = await response.json()
      setEvents(previous => [...previous, ...data.events]); setCursor(data.nextCursor)
    } catch { setError('더 불러오지 못했어요.') } finally { setLoadingMore(false) }
  }

  if (loading) return <p className="py-12 text-center text-sm text-[#8b95a1]">불러오는 중...</p>
  if (error) return <p role="alert" className="py-12 text-center text-sm text-[#b74141]">{error}</p>
  if (!events.length) return <div className="py-12 text-center"><p className="font-semibold">아직 소비 기록이 없어요</p><p className="mt-1 text-sm text-[#8b95a1]">재료를 다 먹거나 버릴 때 기록이 쌓여요</p></div>

  return <div>
    {events.map(event => <div key={event.id} className="flex min-w-0 items-center gap-3 border-b border-[#f2f4f6] py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[#191f28]">{event.itemName}</p>
        <p className="mt-0.5 truncate text-xs text-[#8b95a1]">{new Date(event.occurredAt).toLocaleDateString('ko-KR')} · {event.actorName}{event.quantity ? ` · ${event.quantity}${event.unit || '개'}` : ''}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${event.action === 'EATEN' ? 'bg-[#eaf8f1] text-[#16845a]' : 'bg-[#fff0ee] text-[#e45656]'}`}>{event.action === 'EATEN' ? '다 먹음' : `버림${event.discardReason ? ` · ${reasonLabel[event.discardReason]}` : ''}`}</span>
    </div>)}
    {cursor && <button onClick={() => void loadMore()} disabled={loadingMore} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e8eb] text-sm font-semibold text-[#6b7684]">{loadingMore ? <LoaderCircle className="animate-spin" size={16}/> : null}더 보기</button>}
  </div>
}
