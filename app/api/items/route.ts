import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'

const createItem = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(['KIMCHI', 'SIDE_DISH', 'SOUP_STEW', 'SAUCE_SEASONING', 'BABY_FOOD', 'MEAT_FISH', 'VEGETABLE_FRUIT', 'DAIRY', 'ETC']),
  fridgeType: z.enum(['NORMAL_FRIDGE', 'NORMAL_FREEZER', 'KIMCHI_FRIDGE', 'SIDE_DISH_FRIDGE', 'PANTRY']),
  expiryDate: z.iso.date().nullable(), quantity: z.number().positive().max(100000).nullable(), unit: z.string().trim().max(20).nullable(),
}).strict()
const fridgeNames = { NORMAL_FRIDGE: '일반 냉장고', NORMAL_FREEZER: '냉동실', KIMCHI_FRIDGE: '김치냉장고', SIDE_DISH_FRIDGE: '밑반찬 냉장고', PANTRY: '실온보관' } as const

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족에 합류해주세요.' }, { status: 403 })
  try {
    const items = await prisma.foodItem.findMany({ where: { fridge: { householdId: user.householdId } }, include: { fridge: true }, orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }] })
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const todayMs = Date.parse(`${today}T00:00:00Z`)
    return NextResponse.json(items.map(item => {
      const expiryDay = item.expiryDate ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(item.expiryDate) : null
      return { ...item, dday: expiryDay ? Math.round((Date.parse(`${expiryDay}T00:00:00Z`) - todayMs) / 86400000) : null }
    }), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { console.error('Failed to load items', error); return NextResponse.json({ error: '식재료를 불러오지 못했습니다.' }, { status: 500 }) }
}
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족에 합류해주세요.' }, { status: 403 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  const parsed = createItem.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력 정보를 확인해주세요.' }, { status: 400 })
  const { name, category, fridgeType, expiryDate, quantity, unit } = parsed.data
  const householdId = user.householdId
  try {
    const item = await prisma.$transaction(async tx => {
      let fridge = await tx.fridge.findFirst({ where: { type: fridgeType, householdId }, orderBy: { createdAt: 'asc' } })
      if (!fridge) fridge = await tx.fridge.create({ data: { type: fridgeType, name: fridgeNames[fridgeType], householdId } })
      const food = await tx.foodItem.create({ data: { name, category, fridgeId: fridge.id, expiryDate: expiryDate ? new Date(`${expiryDate}T12:00:00+09:00`) : null, quantity, unit } })
      await tx.auditEvent.create({ data: { actorId: user.id, targetId: food.id, action: 'ITEM_CREATED' } })
      return food
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) { console.error('Failed to create item', error); return NextResponse.json({ error: '등록하지 못했습니다.' }, { status: 500 }) }
}
