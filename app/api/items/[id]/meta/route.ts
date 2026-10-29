import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
const schema = z.object({ cookingPurpose: z.string().max(100).nullable().optional(), personalNote: z.string().max(500).nullable().optional(), plannedQuantity: z.number().positive().max(100000).nullable().optional(), plannedUnit: z.string().max(20).nullable().optional(), pinned: z.boolean().optional() }).strict()
async function allowed(id: string, user: { householdId: string | null }) {
  return user.householdId ? prisma.foodItem.findFirst({ where: { id, fridge: { householdId: user.householdId } }, select: { id: true } }) : null
}
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  const { id } = await context.params
  if (!await allowed(id, user)) return NextResponse.json({ error: '찾을 수 없어요.' }, { status: 404 })
  const meta = await prisma.itemPersonalMeta.findUnique({ where: { userId_foodItemId: { userId: user.id, foodItemId: id } } })
  return NextResponse.json(meta, { headers: { 'Cache-Control': 'no-store' } })
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  const { id } = await context.params
  if (!await allowed(id, user)) return NextResponse.json({ error: '찾을 수 없어요.' }, { status: 404 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력을 확인해주세요.' }, { status: 400 })
  const meta = await prisma.itemPersonalMeta.upsert({ where: { userId_foodItemId: { userId: user.id, foodItemId: id } }, update: parsed.data, create: { ...parsed.data, userId: user.id, foodItemId: id } })
  return NextResponse.json(meta)
}
