import { NextResponse } from 'next/server'
import { assertSameOrigin, requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  const body = await request.json().catch(() => null)
  if (!body || !['APPROVE','REJECT','CANCEL'].includes(body.action)) return NextResponse.json({ error: '요청을 확인해주세요.' }, { status: 400 })
  const { id } = await context.params
  try {
    const result = await prisma.$transaction(async tx => {
      const target = await tx.joinRequest.findUnique({ where: { id }, include: { requester: true } })
      if (!target || target.status !== 'PENDING') return 'NOT_FOUND'
      if (body.action === 'CANCEL') {
        if (target.requesterId !== user.id) return 'NOT_FOUND'
      } else {
        if (target.requesterId === user.id || !user.householdId || target.householdId !== user.householdId) return 'NOT_FOUND'
        const decider = await tx.householdMembership.findFirst({ where: { householdId: target.householdId, userId: user.id, status: 'ACTIVE', user: { status: 'ACTIVE' } } })
        if (!decider) return 'NOT_FOUND'
      }
      if (body.action === 'APPROVE') {
        if (target.requester.status !== 'ACTIVE') return 'NOT_FOUND'
        if (await tx.householdMembership.findFirst({ where: { userId: target.requesterId, status: 'ACTIVE' } })) return 'CONFLICT'
      }
      const changed = await tx.joinRequest.updateMany({ where: { id, status: 'PENDING' }, data: { status: body.action === 'CANCEL' ? 'CANCELLED' : body.action === 'REJECT' ? 'REJECTED' : 'APPROVED', decidedById: body.action === 'CANCEL' ? null : user.id, decidedAt: new Date() } })
      if (!changed.count) return 'CONFLICT'
      if (body.action === 'APPROVE') await tx.householdMembership.create({ data: { householdId: target.householdId, userId: target.requesterId } })
      await tx.auditEvent.create({ data: { actorId: user.id, targetId: id, action: `JOIN_${body.action}` } })
      return 'OK'
    })
    return result === 'OK' ? NextResponse.json({ ok: true }) : NextResponse.json({ error: '처리할 수 없는 신청이에요.' }, { status: result === 'NOT_FOUND' ? 404 : 409 })
  } catch { return NextResponse.json({ error: '이미 가족에 속했거나 신청이 처리됐어요.' }, { status: 409 }) }
}
