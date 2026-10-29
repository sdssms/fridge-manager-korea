'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight, Check, ChefHat, ChevronRight, ClipboardList, Refrigerator as Fridge, Home, Leaf, LoaderCircle, Plus, Search, ShoppingBasket, Snowflake, Sparkles, Trash2, X } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AccountControls } from '@/components/account-controls'
import { PersonalPlan } from '@/components/personal-plan'

type FridgeType = 'NORMAL_FRIDGE' | 'NORMAL_FREEZER' | 'KIMCHI_FRIDGE' | 'SIDE_DISH_FRIDGE'
type Category = 'KIMCHI' | 'SIDE_DISH' | 'SOUP_STEW' | 'SAUCE_SEASONING' | 'BABY_FOOD' | 'MEAT_FISH' | 'VEGETABLE_FRUIT' | 'DAIRY' | 'ETC'
type Tab = 'home' | 'inventory' | 'shopping' | 'recipes'
type FoodItem = { id: string; name: string; category: Category; fridge: { type: FridgeType; name: string }; expiryDate: string | null; dday: number | null; quantity: number | null; unit: string | null }
type ShoppingItem = { id: string; name: string; checked: boolean }

const tabs = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'inventory', label: '냉장고', icon: Fridge },
  { id: 'shopping', label: '장보기', icon: ShoppingBasket },
  { id: 'recipes', label: '요리', icon: ChefHat },
] as const
const fridges: { id: FridgeType; label: string; icon: typeof Fridge }[] = [
  { id: 'NORMAL_FRIDGE', label: '냉장실', icon: Fridge },
  { id: 'NORMAL_FREEZER', label: '냉동실', icon: Snowflake },
  { id: 'KIMCHI_FRIDGE', label: '김치냉장고', icon: Leaf },
  { id: 'SIDE_DISH_FRIDGE', label: '밑반찬', icon: ClipboardList },
]
const categories: { id: Category; label: string }[] = [
  { id: 'VEGETABLE_FRUIT', label: '채소·과일' }, { id: 'MEAT_FISH', label: '육류·생선' },
  { id: 'DAIRY', label: '유제품·계란' }, { id: 'KIMCHI', label: '김치' },
  { id: 'SIDE_DISH', label: '밑반찬' }, { id: 'BABY_FOOD', label: '이유식' },
  { id: 'SOUP_STEW', label: '국·찌개' }, { id: 'SAUCE_SEASONING', label: '양념' }, { id: 'ETC', label: '기타' },
]
const categorySymbol: Record<Category, string> = {
  KIMCHI: '🥬', SIDE_DISH: '🍱', SOUP_STEW: '🍲', SAUCE_SEASONING: '🧂', BABY_FOOD: '🍼', MEAT_FISH: '🥩', VEGETABLE_FRUIT: '🥕', DAIRY: '🥛', ETC: '📦',
}
const initialForm = { name: '', category: 'VEGETABLE_FRUIT' as Category, fridgeType: 'NORMAL_FRIDGE' as FridgeType, expiryDate: '', quantity: '', unit: '' }

function expiryLabel(days: number | null) {
  if (days === null) return '날짜 미설정'
  if (days < 0) return `${Math.abs(days)}일 지남`
  if (days === 0) return '오늘까지'
  return `${days}일 남음`
}
function expiryColor(days: number | null) {
  if (days === null) return 'bg-[#f2f4f6] text-[#6b7684]'
  if (days <= 2) return 'bg-[#fff0ee] text-[#e45656]'
  if (days <= 5) return 'bg-[#fff6e9] text-[#b66e00]'
  return 'bg-[#eaf8f1] text-[#16845a]'
}
function ItemRow({ item, onRemove }: { item: FoodItem; onRemove?: (item: FoodItem) => void }) {
  return <div className="flex min-w-0 items-center gap-3 border-b border-[#f2f4f6] py-3.5 last:border-b-0 sm:gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f5f7f9] text-[24px]" aria-hidden="true">{categorySymbol[item.category]}</div>
    <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-semibold text-[#191f28] sm:text-base">{item.name}</p><p className="mt-0.5 truncate text-xs text-[#8b95a1]">{fridges.find(f => f.id === item.fridge.type)?.label ?? item.fridge.name}{item.quantity ? ` · ${item.quantity}${item.unit || '개'}` : ''}</p></div>
    <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold sm:text-xs ${expiryColor(item.dday)}`}>{expiryLabel(item.dday)}</span>
    {onRemove && <PersonalPlan item={item}/>}
    {onRemove && <button type="button" onClick={() => onRemove(item)} aria-label={`${item.name} 목록에서 제거`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#9aa4b0] transition hover:bg-[#f2f4f6] hover:text-[#e45656] focus-visible:outline-2 focus-visible:outline-[#3182f6]"><Trash2 size={18} /></button>}
  </div>
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('home')
  const [items, setItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<FridgeType | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [shoppingName, setShoppingName] = useState('')
  const [legacyShopping, setLegacyShopping] = useState<ShoppingItem[]>([])
  const [shoppingError, setShoppingError] = useState('')
  const [notice, setNotice] = useState('')

  const loadItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items', { cache: 'no-store' })
      if (!response.ok) throw new Error('load failed')
      const data: FoodItem[] = await response.json()
      if (!Array.isArray(data)) throw new Error('invalid items')
      setItems(data)
      setLoadError('')
    } catch { setLoadError('식재료를 불러오지 못했어요. 잠시 후 다시 시도해주세요.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { const timer = window.setTimeout(() => { void loadItems() }, 0); return () => window.clearTimeout(timer) }, [loadItems])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch('/api/shopping', { cache: 'no-store' }).then(async response => {
        if (!response.ok) throw Error('shopping failed')
        const data = await response.json()
        if (Array.isArray(data)) setShopping(data)
      }).catch(() => setShoppingError('장보기 목록을 불러오지 못했어요.'))
      try { const data = JSON.parse(localStorage.getItem('freshkeep-shopping-v1') || '[]'); if (Array.isArray(data)) setLegacyShopping(data.filter((x): x is ShoppingItem => typeof x?.id === 'string' && typeof x?.name === 'string' && typeof x?.checked === 'boolean')) } catch { /* invalid legacy data ignored */ }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])
  async function addShopping(value: string) {
    const name = value.trim()
    if (!name) return
    try {
      const response = await fetch('/api/shopping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      if (!response.ok) throw Error('add shopping failed')
      const row = await response.json(); setShopping(previous => [...previous, row]); setShoppingName(''); setNotice(`‘${name}’ 장보기에 추가했어요.`)
    } catch { setShoppingError('장보기에 추가하지 못했어요.') }
  }
  async function toggleShopping(id: string, checked: boolean) {
    try { const response = await fetch(`/api/shopping/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checked }) }); if (!response.ok) throw Error('toggle failed'); setShopping(previous => previous.map(x => x.id === id ? { ...x, checked } : x)) } catch { setShoppingError('변경하지 못했어요.') }
  }
  async function deleteShopping(id: string) {
    try { const response = await fetch(`/api/shopping/${encodeURIComponent(id)}`, { method: 'DELETE' }); if (!response.ok) throw Error('delete failed'); setShopping(previous => previous.filter(x => x.id !== id)) } catch { setShoppingError('삭제하지 못했어요.') }
  }
  async function importLegacyShopping() {
    if (!window.confirm('이 브라우저의 장보기 목록을 가족 공동 목록으로 가져올까요? 가족 모두에게 보여요.')) return
    try { const response = await fetch('/api/shopping/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names: legacyShopping.map(x => x.name) }) }); if (!response.ok) throw Error('import failed'); const refreshed = await fetch('/api/shopping', { cache: 'no-store' }); if (!refreshed.ok) throw Error('read failed'); setShopping(await refreshed.json()); localStorage.removeItem('freshkeep-shopping-v1'); setLegacyShopping([]); setNotice('기존 장보기 목록을 가져왔어요.') } catch { setShoppingError('가져오지 못했어요. 다시 시도해주세요.') }
  }
  const expiring = items.filter(item => item.dday !== null && item.dday <= 3)
  const warning = items.filter(item => item.dday !== null && item.dday > 3 && item.dday <= 7)
  const filtered = items.filter(item => (filter === 'ALL' || item.fridge.type === filter) && item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  const recipeIdeas = useMemo(() => {
    const names = items.map(i => i.name).join(' ')
    const result: { title: string; detail: string; tag: string; missing: string; color: string }[] = []
    if (items.some(i => i.category === 'KIMCHI')) result.push({ title: '김치볶음밥', detail: '김치를 먼저 볶아 간단하게 한 끼', tag: '김치 활용', missing: '밥', color: 'bg-[#fff2e9]' })
    if (/계란|달걀/.test(names)) result.push({ title: '계란말이', detail: '계란으로 만드는 간편한 반찬', tag: '계란 활용', missing: '대파', color: 'bg-[#fff8e8]' })
    if (items.some(i => i.category === 'VEGETABLE_FRUIT')) result.push({ title: '채소 볶음', detail: '남은 채소를 한 번에 활용해요', tag: '채소 활용', missing: '식용유', color: 'bg-[#eaf8f1]' })
    if (items.some(i => i.category === 'SIDE_DISH')) result.push({ title: '간단한 집밥 한 상', detail: '있는 밑반찬으로 한 끼 차려요', tag: '밑반찬 활용', missing: '밥', color: 'bg-[#f0f2ff]' })
    return result.slice(0, 3)
  }, [items])

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormError('')
    if (!form.name.trim()) { setFormError('식재료 이름을 입력해주세요.'); return }
    const qty = form.quantity.trim() ? Number(form.quantity) : null
    if (qty !== null && (!Number.isFinite(qty) || qty <= 0)) { setFormError('수량은 0보다 큰 숫자로 입력해주세요.'); return }
    setSaving(true)
    try {
      const response = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), category: form.category, fridgeType: form.fridgeType, expiryDate: form.expiryDate || null, quantity: qty, unit: form.unit.trim() || null }) })
      if (!response.ok) throw new Error('save failed')
      await loadItems(); setForm(initialForm); setSheetOpen(false); setNotice('식재료를 등록했어요.'); setTab('inventory')
    } catch { setFormError('등록하지 못했어요. 다시 시도해주세요.') }
    finally { setSaving(false) }
  }
  async function removeItem(item: FoodItem) {
    if (!window.confirm(`‘${item.name}’을(를) 목록에서 제거할까요? 이 작업은 되돌릴 수 없어요.`)) return
    try {
      const response = await fetch(`/api/items/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('delete failed')
      setItems(previous => previous.filter(i => i.id !== item.id)); setNotice('목록에서 제거했어요.')
    } catch { setNotice('제거하지 못했어요. 다시 시도해주세요.') }
  }
  function go(next: Tab) { setTab(next); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const pageTitles: Record<Tab, string> = { home: '우리집 냉장고', inventory: '냉장고 속 재료', shopping: '장보기 리스트', recipes: '오늘 뭐 먹지?' }

  return <div className="min-h-dvh bg-[#f5f7fa] text-[#191f28] lg:flex">
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#eef0f3] bg-white px-5 py-9 lg:sticky lg:top-0 lg:flex lg:h-dvh">
      <div className="mb-12 flex items-center gap-2.5 px-3"><span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#3182f6] text-white"><Leaf size={22} strokeWidth={2.3}/></span><span className="text-[20px] font-extrabold tracking-[-0.045em]">freshkeep<span className="text-[#3182f6]">.</span></span></div>
      <div className="mb-3 px-4 text-xs font-semibold text-[#a3acb6]">나의 공간</div>
      <nav aria-label="데스크톱 메뉴" className="space-y-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => go(id)} aria-current={tab === id ? 'page' : undefined} className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-[15px] font-semibold transition ${tab === id ? 'bg-[#edf4ff] text-[#3182f6]' : 'text-[#6b7684] hover:bg-[#f5f7fa] hover:text-[#191f28]'}`}><Icon size={20} strokeWidth={2}/>{label}</button>)}</nav>
      <div className="mt-auto rounded-[20px] bg-[#f5f7fa] p-5"><span className="text-[22px]">🌿</span><p className="mt-2 text-sm font-bold">오늘도 신선하게</p><p className="mt-1 text-xs leading-5 text-[#8b95a1]">있는 재료부터 확인하고<br/>알뜰하게 한 끼를 준비해요.</p></div>
    </aside>

    <div className="min-w-0 flex-1 pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-12">
      <header className="sticky top-0 z-20 border-b border-[#eef0f3]/80 bg-white/95 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent">
        <div className="mx-auto flex h-[62px] max-w-[1120px] items-center justify-between px-5 sm:px-8 lg:h-[92px] lg:px-10">
          <div className="flex items-center gap-2 lg:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[#3182f6] text-white"><Leaf size={18}/></span><span className="text-[19px] font-extrabold tracking-[-0.045em]">freshkeep<span className="text-[#3182f6]">.</span></span></div>
          <div className="hidden text-sm font-semibold text-[#6b7684] lg:block">{pageTitles[tab]}</div>
          <div className="flex items-center gap-2"><AccountControls/>{(tab === 'home' || tab === 'inventory') && <button type="button" onClick={() => setSheetOpen(true)} aria-label="식재료 등록" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3182f6] text-white sm:hidden"><Plus size={22}/></button>}</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-5 pt-7 sm:px-8 lg:px-10 lg:pt-2">
        {notice && <div role="status" className="mb-5 flex items-center justify-between rounded-2xl bg-[#eaf8f1] px-4 py-3 text-sm font-medium text-[#16845a]">{notice}<button aria-label="알림 닫기" onClick={() => setNotice('')} className="ml-3 flex h-9 w-9 items-center justify-center"><X size={17}/></button></div>}
        {loadError && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[#fff0ee] p-4 text-sm text-[#b74141]"><span>{loadError}</span><button onClick={() => void loadItems()} className="shrink-0 font-bold underline">다시 시도</button></div>}
        {tab === 'home' && <>
          <div className="mb-6"><p className="mb-1 text-[13px] font-semibold text-[#8b95a1]">FRESHKEEP · HOME</p><h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.055em] sm:text-[36px]">우리 가족 냉장고,<br className="sm:hidden"/> 오늘도 신선하게</h1><p className="mt-2 text-[14px] text-[#6b7684] sm:text-base">먼저 먹을 것부터 챙겨볼까요?</p></div>
          {loading ? <div className="flex h-56 items-center justify-center text-[#8b95a1]"><LoaderCircle className="mr-2 animate-spin" size={20}/> 식재료 확인 중</div> : loadError ? null : <>
            <section className="relative overflow-hidden rounded-[26px] bg-[#3182f6] px-6 py-7 text-white shadow-[0_16px_36px_rgba(49,130,246,0.16)] sm:px-9 sm:py-9">
              <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full border-[32px] border-white/10 sm:right-8 sm:h-64 sm:w-64"/>
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"/>
              <div className="relative"><p className="text-[14px] font-semibold text-blue-100">보관 중인 식재료</p><div className="mt-2 flex items-baseline gap-1"><span className="text-[52px] font-extrabold leading-none tracking-[-0.07em] sm:text-[64px]">{items.length}</span><span className="text-[19px] font-semibold text-blue-100">개</span></div><p className="mt-4 text-[13px] font-medium text-blue-50 sm:text-sm">{expiring.length > 0 ? `이 중 ${expiring.length}개는 3일 안에 확인이 필요해요` : items.length ? '급하게 먹어야 할 재료는 없어요' : '첫 번째 식재료를 등록해보세요'}</p></div>
              <button onClick={() => go('inventory')} className="relative mt-6 flex h-11 items-center gap-1 rounded-xl bg-white/20 px-4 text-[13px] font-bold transition hover:bg-white/30">재료 모두 보기 <ArrowRight size={16}/></button>
            </section>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-[20px] bg-white p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0ee] text-[#e45656]"><AlertCircle size={20}/></span><p className="mt-4 text-[27px] font-bold tracking-tight">{expiring.length}<span className="ml-1 text-sm font-medium text-[#8b95a1]">개</span></p><p className="mt-1 text-[13px] font-medium text-[#6b7684]">3일 안에 확인</p></div><div className="rounded-[20px] bg-white p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6e9] text-[#b66e00]"><Sparkles size={20}/></span><p className="mt-4 text-[27px] font-bold tracking-tight">{warning.length}<span className="ml-1 text-sm font-medium text-[#8b95a1]">개</span></p><p className="mt-1 text-[13px] font-medium text-[#6b7684]">이번 주 안에 확인</p></div></div>
            <div className="mt-8 grid gap-7 lg:grid-cols-[1.35fr_1fr] lg:items-start">
              <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold tracking-[-0.04em]">먼저 먹으면 좋아요</h2><button onClick={() => go('inventory')} className="flex h-11 items-center text-[13px] font-semibold text-[#6b7684]">전체 보기 <ChevronRight size={16}/></button></div><div className="rounded-[22px] bg-white px-5 py-1 sm:px-6">{items.length ? [...items].sort((a,b) => (a.dday ?? 9999) - (b.dday ?? 9999)).slice(0,3).map(i => <ItemRow key={i.id} item={i}/>) : <div className="py-9 text-center"><div className="text-3xl">🧺</div><p className="mt-2 text-sm font-semibold">아직 등록된 재료가 없어요</p><p className="mt-1 text-xs text-[#8b95a1]">식재료를 등록하고 신선하게 관리해요</p><button onClick={() => setSheetOpen(true)} className="mt-4 h-11 rounded-xl bg-[#3182f6] px-5 text-sm font-bold text-white">식재료 등록</button></div>}</div></section>
              <section><h2 className="mb-4 text-xl font-bold tracking-[-0.04em]">생활을 더 편하게</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><button onClick={() => go('shopping')} className="flex min-h-[94px] items-center gap-4 rounded-[22px] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ff] text-[#3182f6]"><ShoppingBasket size={23}/></span><span className="min-w-0 flex-1"><strong className="block text-[15px]">장보기 리스트</strong><small className="mt-1 block text-xs text-[#8b95a1]">필요한 재료를 잊지 않게</small></span><ChevronRight size={18} className="shrink-0 text-[#b0b8c1]"/></button><button onClick={() => go('recipes')} className="flex min-h-[94px] items-center gap-4 rounded-[22px] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf8f1] text-[#16845a]"><ChefHat size={23}/></span><span className="min-w-0 flex-1"><strong className="block text-[15px]">오늘 뭐 먹지?</strong><small className="mt-1 block text-xs text-[#8b95a1]">있는 재료로 요리 아이디어</small></span><ChevronRight size={18} className="shrink-0 text-[#b0b8c1]"/></button></div></section>
            </div>
          </>}
        </>}
        {tab === 'inventory' && <><div className="mb-6 flex items-end justify-between gap-3"><div><p className="mb-1 text-[13px] font-semibold text-[#8b95a1]">MY FRIDGE</p><h1 className="text-[28px] font-bold tracking-[-0.05em] sm:text-[36px]">냉장고 속 재료</h1><p className="mt-1 text-sm text-[#6b7684]">{loading ? '불러오는 중' : loadError ? '재료를 확인할 수 없어요' : `지금 ${items.length}개를 보관하고 있어요`}</p></div><button onClick={() => setSheetOpen(true)} className="hidden h-12 items-center gap-2 rounded-xl bg-[#3182f6] px-5 text-sm font-bold text-white sm:flex"><Plus size={19}/>재료 등록</button></div><div className="relative mb-4"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b95a1]" size={19}/><Input aria-label="식재료 검색" value={search} onChange={e => setSearch(e.target.value)} placeholder="식재료 이름으로 검색" className="h-13 rounded-[15px] border-0 bg-white pl-12 text-[15px] shadow-none placeholder:text-[#a3acb6]"/></div><div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-none sm:mx-0 sm:px-0"><button onClick={() => setFilter('ALL')} className={`h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold ${filter === 'ALL' ? 'bg-[#191f28] text-white' : 'bg-white text-[#6b7684]'}`}>전체</button>{fridges.map(f => <button key={f.id} onClick={() => setFilter(f.id)} className={`h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold ${filter === f.id ? 'bg-[#191f28] text-white' : 'bg-white text-[#6b7684]'}`}>{f.label}</button>)}</div><div className="rounded-[22px] bg-white px-5 py-1 sm:px-6">{loading ? <p className="py-12 text-center text-sm text-[#8b95a1]">불러오는 중...</p> : loadError ? <p className="py-12 text-center text-sm text-[#8b95a1]">다시 시도 버튼을 눌러주세요.</p> : filtered.length ? filtered.map(i => <ItemRow key={i.id} item={i} onRemove={removeItem}/>) : <div className="py-12 text-center"><Fridge className="mx-auto text-[#b0b8c1]" size={36}/><p className="mt-3 font-semibold">{search || filter !== 'ALL' ? '조건에 맞는 재료가 없어요' : '냉장고가 비어 있어요'}</p><p className="mt-1 text-sm text-[#8b95a1]">{search || filter !== 'ALL' ? '검색어나 보관 위치를 바꿔보세요' : '첫 번째 재료를 등록해보세요'}</p>{!search && filter === 'ALL' && <button onClick={() => setSheetOpen(true)} className="mt-5 h-11 rounded-xl bg-[#3182f6] px-5 text-sm font-bold text-white">재료 등록</button>}</div>}</div><p className="mt-4 text-xs leading-5 text-[#8b95a1]">제거하면 목록에서 완전히 삭제돼요. 소비 기록은 아직 제공하지 않아요.</p></>}
        {tab === 'shopping' && <><p className="mb-1 text-[13px] font-semibold text-[#8b95a1]">SHOPPING LIST</p><h1 className="text-[28px] font-bold tracking-[-0.05em] sm:text-[36px]">장보기 리스트</h1><p className="mb-6 mt-2 text-sm text-[#6b7684]">가족이 함께 필요한 것을 적고 장 보면서 체크하세요.</p>{shoppingError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{shoppingError}</p>}{legacyShopping.length > 0 && <div className="mb-4 rounded-2xl bg-[#edf4ff] p-4 text-sm"><p className="font-semibold">이 브라우저에 이전 장보기 {legacyShopping.length}개가 있어요.</p><p className="mt-1 text-xs text-[#6b7684]">가족 목록으로 가져오면 구성원 모두 볼 수 있어요.</p><div className="mt-3 flex gap-3"><button onClick={() => void importLegacyShopping()} className="h-11 rounded-xl bg-[#3182f6] px-4 font-bold text-white">가져오기</button><button onClick={() => { localStorage.removeItem('freshkeep-shopping-v1'); setLegacyShopping([]) }} className="h-11 px-2 text-[#6b7684]">이전 목록 지우기</button></div></div>}<form onSubmit={e => { e.preventDefault(); addShopping(shoppingName) }} className="flex gap-2"><Input aria-label="장볼 식재료" value={shoppingName} onChange={e => setShoppingName(e.target.value)} maxLength={80} placeholder="예: 계란, 대파, 우유" className="h-13 min-w-0 flex-1 rounded-[15px] border-0 bg-white px-4 text-[15px]"/><button type="submit" className="flex h-[52px] shrink-0 items-center gap-1 rounded-[15px] bg-[#3182f6] px-5 text-sm font-bold text-white"><Plus size={18}/>추가</button></form><div className="mt-6 rounded-[22px] bg-white px-5 py-2 sm:px-6">{shopping.length ? shopping.map(i => <div key={i.id} className="flex min-h-[66px] items-center gap-3 border-b border-[#f2f4f6] last:border-0"><button aria-label={`${i.name} ${i.checked ? '체크 해제' : '구매 체크'}`} onClick={() => void toggleShopping(i.id, !i.checked)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${i.checked ? 'bg-[#3182f6] text-white' : 'border-2 border-[#d5dce2] text-transparent'}`}><Check size={21}/></button><span className={`min-w-0 flex-1 truncate text-[15px] font-medium ${i.checked ? 'text-[#b0b8c1] line-through' : ''}`}>{i.name}</span><button aria-label={`${i.name} 삭제`} onClick={() => void deleteShopping(i.id)} className="flex h-11 w-11 items-center justify-center text-[#9aa4b0] hover:text-[#e45656]"><X size={19}/></button></div>) : <div className="py-12 text-center"><ShoppingBasket size={38} className="mx-auto text-[#b0b8c1]"/><p className="mt-3 font-semibold">아직 장볼 재료가 없어요</p><p className="mt-1 text-sm text-[#8b95a1]">위에서 필요한 재료를 추가해보세요</p></div>}</div><p className="mt-4 text-xs leading-5 text-[#8b95a1]">이 목록은 가족과 공유돼요. 재료를 가져오면 가족 모두에게 보여요.</p></>}
        {tab === 'recipes' && <><p className="mb-1 text-[13px] font-semibold text-[#8b95a1]">COOK WITH WHAT YOU HAVE</p><h1 className="text-[28px] font-bold tracking-[-0.05em] sm:text-[36px]">오늘 뭐 먹지?</h1><p className="mb-6 mt-2 text-sm text-[#6b7684]">냉장고에 있는 재료로 시작하는 간단한 아이디어예요.</p>{loading ? <p className="py-12 text-sm text-[#8b95a1]">재료 확인 중...</p> : loadError ? null : recipeIdeas.length ? <div className="grid gap-4 sm:grid-cols-2">{recipeIdeas.map(idea => <article key={idea.title} className="overflow-hidden rounded-[24px] bg-white"><div className={`flex h-32 items-center justify-between px-6 ${idea.color}`}><ChefHat size={44} strokeWidth={1.4} className="text-[#6b7684]"/><span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#4e5968]">{idea.tag}</span></div><div className="p-6"><h2 className="text-xl font-bold">{idea.title}</h2><p className="mt-2 text-sm text-[#6b7684]">{idea.detail}</p><button onClick={() => { addShopping(idea.missing); go('shopping') }} className="mt-5 flex h-11 items-center gap-1 text-sm font-bold text-[#3182f6]">{idea.missing} 장보기에 담기 <ArrowRight size={16}/></button></div></article>)}</div> : <div className="rounded-[22px] bg-white px-6 py-12 text-center"><ChefHat className="mx-auto text-[#b0b8c1]" size={40}/><p className="mt-4 font-semibold">추천할 재료가 아직 없어요</p><p className="mt-1 text-sm text-[#8b95a1]">김치, 채소, 계란 등을 등록해보세요</p><button onClick={() => setSheetOpen(true)} className="mt-5 h-11 rounded-xl bg-[#3182f6] px-5 text-sm font-bold text-white">식재료 등록</button></div>}<p className="mt-5 text-xs leading-5 text-[#8b95a1]">재료 종류를 바탕으로 한 아이디어이며, 조리법이나 필요한 재료 전체를 제공하지 않아요.</p></>}
      </main>
    </div>
    <nav aria-label="모바일 메뉴" className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eef0f3] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"><div className="mx-auto flex h-[72px] max-w-[500px] items-center justify-around">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)} className={`flex h-[58px] min-w-[70px] flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${tab === id ? 'text-[#3182f6]' : 'text-[#9aa4b0]'}`}><Icon size={23} strokeWidth={tab === id ? 2.4 : 1.9}/><span>{label}</span></button>)}</div></nav>

    <Sheet open={sheetOpen} onOpenChange={open => { setSheetOpen(open); if (!open) setFormError('') }}><SheetContent side="bottom" className="mx-auto flex max-h-[min(88dvh,800px)] w-full max-w-[560px] flex-col gap-0 overflow-hidden rounded-t-[28px] border-0 bg-white p-0 sm:bottom-1/2 sm:translate-y-1/2 sm:rounded-[28px]"><SheetHeader className="shrink-0 border-b border-[#f2f4f6] px-6 pb-4 pt-7 text-left"><SheetTitle className="text-[23px] font-bold tracking-[-0.04em]">식재료 등록</SheetTitle><SheetDescription className="text-[13px] text-[#8b95a1]">이름과 보관 위치만 정하면 바로 시작할 수 있어요.</SheetDescription></SheetHeader><form onSubmit={submitItem} className="flex min-h-0 flex-1 flex-col"><div className="space-y-6 overflow-y-auto px-6 py-6"><div><Label htmlFor="food-name" className="mb-2 block text-sm font-semibold">식재료 이름 <span className="text-[#e45656]">*</span></Label><Input id="food-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={80} placeholder="예: 배추김치" className="h-12 rounded-xl text-base" required/></div><div><p className="mb-3 text-sm font-semibold">어디에 보관하나요?</p><div className="grid grid-cols-2 gap-2">{fridges.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setForm({ ...form, fridgeType: id })} aria-pressed={form.fridgeType === id} className={`flex h-13 items-center gap-2 rounded-xl border px-3 text-left text-[13px] font-semibold ${form.fridgeType === id ? 'border-[#3182f6] bg-[#edf4ff] text-[#3182f6]' : 'border-[#e5e8eb] text-[#6b7684]'}`}><Icon size={18}/>{label}</button>)}</div></div><div><Label htmlFor="food-category" className="mb-2 block text-sm font-semibold">재료 종류</Label><select id="food-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })} className="h-12 w-full rounded-xl border border-[#e5e8eb] bg-white px-3 text-sm focus:outline-[#3182f6]">{categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div><div><Label htmlFor="food-expiry" className="mb-2 block text-sm font-semibold">유통기한 <span className="font-normal text-[#8b95a1]">선택</span></Label><Input id="food-expiry" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="h-12 rounded-xl text-base"/></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="food-qty" className="mb-2 block text-sm font-semibold">수량 <span className="font-normal text-[#8b95a1]">선택</span></Label><Input id="food-qty" type="number" min="0.01" step="any" inputMode="decimal" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="예: 2" className="h-12 rounded-xl"/></div><div><Label htmlFor="food-unit" className="mb-2 block text-sm font-semibold">단위 <span className="font-normal text-[#8b95a1]">선택</span></Label><Input id="food-unit" maxLength={20} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="개, 팩, 큐브" className="h-12 rounded-xl"/></div></div></div><div className="shrink-0 border-t border-[#f2f4f6] bg-white px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">{formError && <p role="alert" className="mb-2 text-sm text-[#e45656]">{formError}</p>}<Button type="submit" disabled={saving} className="h-13 w-full rounded-xl bg-[#3182f6] text-[15px] font-bold text-white hover:bg-[#2272e5]">{saving ? '등록하는 중...' : '등록하기'}</Button></div></form></SheetContent></Sheet>
  </div>
}
