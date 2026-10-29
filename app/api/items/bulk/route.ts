import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
import { rateLimit } from '@/lib/security'

const singleItem = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(['KIMCHI', 'SIDE_DISH', 'SOUP_STEW', 'SAUCE_SEASONING', 'BABY_FOOD', 'MEAT_FISH', 'VEGETABLE_FRUIT', 'DAIRY', 'ETC']),
  fridgeType: z.enum(['NORMAL_FRIDGE', 'NORMAL_FREEZER', 'KIMCHI_FRIDGE', 'SIDE_DISH_FRIDGE', 'PANTRY']),
  expiryDate: z.iso.date().nullable().optional(),
  quantity: z.number().positive().max(100000).nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
}).strict()
const bulkSchema = z.object({ items: z.array(singleItem).min(1).max(200) }).strict()
const fridgeNames = { NORMAL_FRIDGE: '일반 냉장고', NORMAL_FREEZER: '냉동실', KIMCHI_FRIDGE: '김치냉장고', SIDE_DISH_FRIDGE: '밑반찬 냉장고', PANTRY: '실온보관' } as const

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족에 합류해주세요.' }, { status: 403 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  if (!(await rateLimit(request, 'items-bulk-user', user.id, 20))) return NextResponse.json({ error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  const parsed = bulkSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력 정보를 확인해주세요. (name/category/fridgeType 필수, 최대 200개)' }, { status: 400 })
  const householdId = user.householdId
  try {
    const created = await prisma.$transaction(async tx => {
      const fridgeCache = new Map<string, string>()
      const results = []
      for (const entry of parsed.data.items) {
        let fridgeId = fridgeCache.get(entry.fridgeType)
        if (!fridgeId) {
          let fridge = await tx.fridge.findFirst({ where: { type: entry.fridgeType, householdId }, orderBy: { createdAt: 'asc' } })
          if (!fridge) fridge = await tx.fridge.create({ data: { type: entry.fridgeType, name: fridgeNames[entry.fridgeType], householdId } })
          fridgeId = fridge.id
          fridgeCache.set(entry.fridgeType, fridgeId)
        }
        const food = await tx.foodItem.create({
          data: {
            name: entry.name,
            category: entry.category,
            fridgeId,
            expiryDate: entry.expiryDate ? new Date(`${entry.expiryDate}T12:00:00+09:00`) : null,
            quantity: entry.quantity ?? null,
            unit: entry.unit ?? null,
          },
        })
        results.push(food)
      }
      await tx.auditEvent.create({ data: { actorId: user.id, action: `ITEMS_BULK_CREATED:${results.length}` } })
      return results
    })
    return NextResponse.json({ created: created.length, items: created }, { status: 201 })
  } catch (error) {
    console.error('Failed to bulk create items', error)
    return NextResponse.json({ error: '등록하지 못했습니다.' }, { status: 500 })
  }
}
