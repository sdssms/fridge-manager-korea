import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
const schema = z.object({ name: z.string().trim().min(1).max(60), type: z.enum(['NORMAL_FRIDGE','NORMAL_FREEZER','KIMCHI_FRIDGE','SIDE_DISH_FRIDGE','PANTRY']) }).strict()
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족에 합류해주세요.' }, { status: 403 })
  const fridges = await prisma.fridge.findMany({ where: { householdId: user.householdId }, include: { items: true } })
  return NextResponse.json(fridges, { headers: { 'Cache-Control': 'no-store' } })
}
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '입력을 확인해주세요.' }, { status: 400 })
  const fridge = await prisma.fridge.create({ data: { ...parsed.data, householdId: user.householdId } })
  return NextResponse.json(fridge, { status: 201 })
}
