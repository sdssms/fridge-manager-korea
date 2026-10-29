import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const parsed = z.object({ checked: z.boolean() }).strict().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력 오류' }, { status: 400 })
  const { id } = await context.params
  const updated = await prisma.shoppingItem.updateMany({ where: { id, householdId: user.householdId }, data: parsed.data })
  return updated.count ? NextResponse.json({ success: true }) : NextResponse.json({ error: '찾을 수 없어요.' }, { status: 404 })
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const { id } = await context.params
  const deleted = await prisma.shoppingItem.deleteMany({ where: { id, householdId: user.householdId } })
  return deleted.count ? NextResponse.json({ success: true }) : NextResponse.json({ error: '찾을 수 없어요.' }, { status: 404 })
}
