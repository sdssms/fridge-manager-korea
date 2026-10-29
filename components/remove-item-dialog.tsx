'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { primary } from '@/components/auth-layout'

const reasons: { id: 'EXPIRED' | 'SPOILED' | 'TOO_MUCH' | 'OTHER'; label: string }[] = [
  { id: 'EXPIRED', label: '유통기한이 지났어요' },
  { id: 'SPOILED', label: '맛이나 상태가 변했어요' },
  { id: 'TOO_MUCH', label: '너무 많이 샀어요' },
  { id: 'OTHER', label: '기타' },
]

export function RemoveItemDialog({ name, expired, onConfirm }: { name: string; expired: boolean; onConfirm: (body: { action: 'EATEN' } | { action: 'DISCARDED'; discardReason: typeof reasons[number]['id'] }) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<'EATEN' | 'DISCARDED'>(expired ? 'DISCARDED' : 'EATEN')
  const [reason, setReason] = useState<typeof reasons[number]['id']>('EXPIRED')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function show() { setChoice(expired ? 'DISCARDED' : 'EATEN'); setReason('EXPIRED'); setError(''); setOpen(true) }
  async function confirm() {
    setBusy(true); setError('')
    try {
      await onConfirm(choice === 'EATEN' ? { action: 'EATEN' } : { action: 'DISCARDED', discardReason: reason })
      setOpen(false)
    } catch { setError('처리하지 못했어요. 다시 시도해주세요.') } finally { setBusy(false) }
  }
  return <>
    <button type="button" onClick={show} aria-label={`${name} 목록에서 제거`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#9aa4b0] transition hover:bg-[#f2f4f6] hover:text-[#e45656] focus-visible:outline-2 focus-visible:outline-[#2fa36e]"><Trash2 size={18} /></button>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="mx-auto max-h-[85dvh] w-full max-w-[560px] overflow-auto rounded-t-[28px] bg-white p-6 sm:bottom-1/2 sm:translate-y-1/2 sm:rounded-[28px]">
        <SheetHeader className="text-left"><SheetTitle className="text-[22px]">{name} 다 썼어요?</SheetTitle><SheetDescription>이 작업은 되돌릴 수 없어요. 어떻게 됐는지 알려주면 다음에 뭘 줄여야 할지 알 수 있어요.</SheetDescription></SheetHeader>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={() => setChoice('EATEN')} className={`h-12 flex-1 rounded-xl text-sm font-bold ${choice === 'EATEN' ? 'bg-[#2fa36e] text-white' : 'border border-[#e5e8eb] text-[#6b7684]'}`}>다 먹었어요</button>
          <button type="button" onClick={() => setChoice('DISCARDED')} className={`h-12 flex-1 rounded-xl text-sm font-bold ${choice === 'DISCARDED' ? 'bg-[#e45656] text-white' : 'border border-[#e5e8eb] text-[#6b7684]'}`}>버렸어요</button>
        </div>
        {choice === 'DISCARDED' && <div className="mt-5"><p className="mb-2 text-sm font-semibold">왜 버렸나요?</p><div className="grid grid-cols-2 gap-2">{reasons.map(r => <button type="button" key={r.id} onClick={() => setReason(r.id)} aria-pressed={reason === r.id} className={`h-12 rounded-xl border px-3 text-left text-[13px] font-semibold ${reason === r.id ? 'border-[#e45656] bg-[#fff0ee] text-[#e45656]' : 'border-[#e5e8eb] text-[#6b7684]'}`}>{r.label}</button>)}</div></div>}
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <button className={`${primary} mt-7`} onClick={() => void confirm()} disabled={busy}>{busy ? '처리하는 중...' : '제거하기'}</button>
      </SheetContent>
    </Sheet>
  </>
}
