import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertSameOrigin, requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  if (user.householdId) return NextResponse.json({ error: '이미 가족에 속해 있어요.' }, { status: 409 })
  const parsed = z.object({ name: z.string().trim().min(2).max(60) }).strict().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '가족 이름을 확인해주세요.' }, { status: 400 })
  try {
    const household = await prisma.$transaction(async tx => {
      const existing = await tx.householdMembership.findFirst({ where: { userId: user.id, status: 'ACTIVE' } })
      const pending = await tx.joinRequest.findFirst({ where: { requesterId: user.id, status: 'PENDING' } })
      if (existing || pending) throw Error('CONFLICT')
      const created = await tx.household.create({ data: { name: parsed.data.name, createdById: user.id } })
      await tx.householdMembership.create({ data: { householdId: created.id, userId: user.id } })
      await tx.auditEvent.create({ data: { action: 'HOUSEHOLD_CREATED', actorId: user.id, targetId: created.id } })
      return created
    })
    return NextResponse.json({ household: { id: household.id, name: household.name } }, { status: 201 })
  } catch { return NextResponse.json({ error: '가족 생성 상태를 확인해주세요.' }, { status: 409 }) }
}
