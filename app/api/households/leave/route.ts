import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { assertSameOrigin, requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  try {
    const householdId = user.householdId
    const result = await prisma.$transaction(async tx => {
      const members = await tx.householdMembership.count({ where: { householdId, status: 'ACTIVE', user: { status: 'ACTIVE' } } })
      if (members <= 1) return false
      const left = await tx.householdMembership.updateMany({ where: { householdId, userId: user.id, status: 'ACTIVE' }, data: { status: 'LEFT', leftAt: new Date() } })
      if (!left.count) return false
      await tx.itemPersonalMeta.deleteMany({ where: { userId: user.id, foodItem: { fridge: { householdId } } } })
      await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })
      await tx.auditEvent.create({ data: { actorId: user.id, targetId: householdId, action: 'HOUSEHOLD_LEFT' } })
      return true
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    return result ? NextResponse.json({ ok: true }) : NextResponse.json({ error: '마지막 구성원은 탈퇴할 수 없어요.' }, { status: 409 })
  } catch { return NextResponse.json({ error: '탈퇴 상태를 확인한 뒤 다시 시도해주세요.' }, { status: 409 }) }
}
