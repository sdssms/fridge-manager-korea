'use client'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { field, primary } from '@/components/auth-layout'

type Item = { id: string; name: string; quantity: number | null; unit: string | null }

export function QuantityEditor({ item, onSaved }: { item: Item; onSaved: (quantity: number | null, unit: string | null) => void }) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function show() { setQuantity(item.quantity?.toString() ?? ''); setUnit(item.unit ?? ''); setError(''); setOpen(true) }
  const half = item.quantity != null ? Math.round((item.quantity / 2) * 100) / 100 : null
  async function save() {
    const trimmed = quantity.trim()
    const qty = trimmed ? Number(trimmed) : null
    if (qty !== null && (!Number.isFinite(qty) || qty <= 0)) { setError('수량은 0보다 큰 숫자로 입력해주세요.'); return }
    setBusy(true); setError('')
    try {
      const response = await fetch(`/api/items/${encodeURIComponent(item.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: qty, unit: unit.trim() || null }) })
      if (!response.ok) throw Error()
      onSaved(qty, unit.trim() || null)
      setOpen(false)
    } catch { setError('수정하지 못했어요. 다시 시도해주세요.') } finally { setBusy(false) }
  }
  return <>
    <button type="button" aria-label={`${item.name} 수량 수정`} onClick={show} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#9aa4b0] transition hover:bg-[#f2f4f6] hover:text-[#2fa36e] focus-visible:outline-2 focus-visible:outline-[#2fa36e]"><Pencil size={17}/></button>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="mx-auto max-h-[85dvh] w-full max-w-[560px] overflow-auto rounded-t-[28px] bg-white p-6 sm:bottom-1/2 sm:translate-y-1/2 sm:rounded-[28px]">
        <SheetHeader className="text-left"><SheetTitle className="text-[22px]">{item.name} · 수량 수정</SheetTitle><SheetDescription>다 쓴 만큼 줄이거나 남은 양을 다시 입력해요. 가족 모두에게 반영돼요.</SheetDescription></SheetHeader>
        <div className="mt-7 space-y-4">
          <label className="block text-sm font-semibold">수량 <span className="font-normal text-[#8b95a1]">비워두면 수량 미설정</span><input className={`mt-2 ${field}`} type="number" min="0.01" step="any" inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="예: 5"/></label>
          <label className="block text-sm font-semibold">단위<input className={`mt-2 ${field}`} maxLength={20} value={unit} onChange={e => setUnit(e.target.value)} placeholder="개, 팩, kg"/></label>
          {half !== null && <button type="button" onClick={() => setQuantity(half.toString())} className="h-11 w-full rounded-xl border border-[#e5e8eb] text-sm font-semibold text-[#6b7684] transition hover:border-[#2fa36e] hover:text-[#2fa36e]">절반만 남기기 ({item.quantity}{item.unit || '개'} → {half}{item.unit || '개'})</button>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button className={primary} onClick={() => void save()} disabled={busy}>{busy ? '저장 중...' : '저장'}</button>
        </div>
      </SheetContent>
    </Sheet>
  </>
}
