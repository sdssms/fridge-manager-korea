import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
const updateSchema = z.object({ name: z.string().trim().min(1).max(80).optional(), quantity: z.number().positive().max(100000).nullable().optional(), unit: z.string().max(20).nullable().optional(), expiryDate: z.iso.date().nullable().optional() }).strict()
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const { id } = await context.params
  const result = await prisma.$transaction(async tx => {
    const removed = await tx.foodItem.deleteMany({ where: { id, fridge: { householdId: user.householdId! } } })
    if (removed.count) await tx.auditEvent.create({ data: { actorId: user.id, targetId: id, action: 'ITEM_DELETED' } })
    return removed.count
  })
  return result ? NextResponse.json({ success: true }) : NextResponse.json({ error: '재료를 찾지 못했어요.' }, { status: 404 })
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력 정보를 확인해주세요.' }, { status: 400 })
  const { id } = await context.params
  const data: Prisma.FoodItemUpdateManyMutationInput = { ...parsed.data, ...(parsed.data.expiryDate !== undefined ? { expiryDate: parsed.data.expiryDate ? new Date(`${parsed.data.expiryDate}T12:00:00+09:00`) : null } : {}) }
  const count = await prisma.foodItem.updateMany({ where: { id, fridge: { householdId: user.householdId } }, data })
  return count.count ? NextResponse.json({ success: true }) : NextResponse.json({ error: '재료를 찾지 못했어요.' }, { status: 404 })
}
