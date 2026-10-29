import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족에 합류해주세요.' }, { status: 403 })
  const rows = await prisma.shoppingItem.findMany({ where: { householdId: user.householdId }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } })
}
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const parsed = z.object({ name: z.string().trim().min(1).max(80) }).strict().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '재료 이름을 확인해주세요.' }, { status: 400 })
  const row = await prisma.shoppingItem.create({ data: { name: parsed.data.name, householdId: user.householdId, addedById: user.id } })
  return NextResponse.json(row, { status: 201 })
}
