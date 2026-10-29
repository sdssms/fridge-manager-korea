import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createItem = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(['KIMCHI', 'SIDE_DISH', 'SOUP_STEW', 'SAUCE_SEASONING', 'BABY_FOOD', 'MEAT_FISH', 'VEGETABLE_FRUIT', 'DAIRY', 'ETC']),
  fridgeType: z.enum(['NORMAL_FRIDGE', 'NORMAL_FREEZER', 'KIMCHI_FRIDGE', 'SIDE_DISH_FRIDGE']),
  expiryDate: z.iso.date().nullable(),
  quantity: z.number().positive().max(100000).nullable(),
  unit: z.string().trim().max(20).nullable(),
})

const fridgeNames = {
  NORMAL_FRIDGE: '일반 냉장고',
  NORMAL_FREEZER: '냉동실',
  KIMCHI_FRIDGE: '김치냉장고',
  SIDE_DISH_FRIDGE: '밑반찬 냉장고',
} as const

export async function GET() {
  try {
    const items = await prisma.foodItem.findMany({
      include: { fridge: true },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
    })
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const todayMs = Date.parse(`${today}T00:00:00Z`)
    return NextResponse.json(items.map(item => {
      const expiryDay = item.expiryDate ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(item.expiryDate) : null
      return { ...item, dday: expiryDay ? Math.round((Date.parse(`${expiryDay}T00:00:00Z`) - todayMs) / 86400000) : null }
    }))
  } catch (error) {
    console.error('Failed to load items', error)
    return NextResponse.json({ error: '식재료를 불러오지 못했습니다.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const parsed = createItem.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: '입력 정보를 확인해주세요.' }, { status: 400 })
    const { name, category, fridgeType, expiryDate, quantity, unit } = parsed.data
    let fridge = await prisma.fridge.findFirst({ where: { type: fridgeType }, orderBy: { createdAt: 'asc' } })
    if (!fridge) fridge = await prisma.fridge.create({ data: { type: fridgeType, name: fridgeNames[fridgeType] } })
    const item = await prisma.foodItem.create({
      data: { name, category, fridgeId: fridge.id, expiryDate: expiryDate ? new Date(`${expiryDate}T12:00:00+09:00`) : null, quantity, unit },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Failed to create item', error)
    return NextResponse.json({ error: '등록하지 못했습니다. 다시 시도해주세요.' }, { status: 500 })
  }
}
