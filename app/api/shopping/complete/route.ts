import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
import { rateLimit } from '@/lib/security'

const entrySchema = z.object({
  shoppingItemId: z.string().min(1),
  category: z.enum(['KIMCHI', 'SIDE_DISH', 'SOUP_STEW', 'SAUCE_SEASONING', 'BABY_FOOD', 'MEAT_FISH', 'VEGETABLE_FRUIT', 'DAIRY', 'ETC']),
  fridgeType: z.enum(['NORMAL_FRIDGE', 'NORMAL_FREEZER', 'KIMCHI_FRIDGE', 'SIDE_DISH_FRIDGE', 'PANTRY']),
  expiryDate: z.iso.date().nullable().optional(),
  quantity: z.number().positive().max(100000).nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
}).strict()
const schema = z.object({ items: z.array(entrySchema).min(1).max(200) }).strict()
const fridgeNames = { NORMAL_FRIDGE: '일반 냉장고', NORMAL_FREEZER: '냉동실', KIMCHI_FRIDGE: '김치냉장고', SIDE_DISH_FRIDGE: '밑반찬 냉장고', PANTRY: '실온보관' } as const

/**
 * Converts checked shopping-list entries into fridge stock in one transaction,
 * then deletes the originating ShoppingItem rows. Only CHECKED items belonging
 * to the caller's household may be converted; unchecked or cross-household ids
 * are rejected outright rather than silently skipped, so the client can't be
 * surprised by a partial result.
 */
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족에 합류해주세요.' }, { status: 403 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  if (!(await rateLimit(request, 'shopping-complete-user', user.id, 20))) return NextResponse.json({ error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력 정보를 확인해주세요.' }, { status: 400 })
  const householdId = user.householdId
  const ids = parsed.data.items.map(x => x.shoppingItemId)
  if (new Set(ids).size !== ids.length) return NextResponse.json({ error: '같은 장보기 항목이 중복됐어요.' }, { status: 400 })
  try {
    const created = await prisma.$transaction(async tx => {
      const shoppingItems = await tx.shoppingItem.findMany({ where: { id: { in: ids }, householdId, checked: true } })
      if (shoppingItems.length !== ids.length) return null
      const shoppingById = new Map(shoppingItems.map(s => [s.id, s]))
      const fridgeCache = new Map<string, string>()
      const items = []
      for (const entry of parsed.data.items) {
        const shoppingItem = shoppingById.get(entry.shoppingItemId)!
        let fridgeId = fridgeCache.get(entry.fridgeType)
        if (!fridgeId) {
          let fridge = await tx.fridge.findFirst({ where: { type: entry.fridgeType, householdId }, orderBy: { createdAt: 'asc' } })
          if (!fridge) fridge = await tx.fridge.create({ data: { type: entry.fridgeType, name: fridgeNames[entry.fridgeType], householdId } })
          fridgeId = fridge.id
          fridgeCache.set(entry.fridgeType, fridgeId)
        }
        const food = await tx.foodItem.create({
          data: {
            name: shoppingItem.name,
            category: entry.category,
            fridgeId,
            expiryDate: entry.expiryDate ? new Date(`${entry.expiryDate}T12:00:00+09:00`) : null,
            quantity: entry.quantity ?? null,
            unit: entry.unit ?? null,
          },
        })
        items.push(food)
      }
      await tx.shoppingItem.deleteMany({ where: { id: { in: ids }, householdId } })
      await tx.auditEvent.create({ data: { actorId: user.id, action: `SHOPPING_COMPLETED:${items.length}` } })
      return items
    })
    if (created === null) return NextResponse.json({ error: '체크된 장보기 항목만 재고로 담을 수 있어요.' }, { status: 400 })
    return NextResponse.json({ created: created.length, items: created }, { status: 201 })
  } catch (error) {
    console.error('Failed to complete shopping list', error)
    return NextResponse.json({ error: '재고에 담지 못했습니다.' }, { status: 500 })
  }
}
