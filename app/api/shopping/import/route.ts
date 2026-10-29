import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser } from '@/lib/auth'
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const parsed = z.object({ names: z.array(z.string().trim().min(1).max(80)).max(100) }).strict().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '목록을 확인해주세요.' }, { status: 400 })
  const names = [...new Set(parsed.data.names)]
  const result = await prisma.$transaction(async tx => {
    const existing = await tx.shoppingItem.findMany({ where: { householdId: user.householdId! }, select: { name: true } })
    const known = new Set(existing.map(x => x.name))
    return tx.shoppingItem.createMany({ data: names.filter(name => !known.has(name)).map(name => ({ name, householdId: user.householdId!, addedById: user.id })) })
  })
  return NextResponse.json({ imported: result.count })
}
