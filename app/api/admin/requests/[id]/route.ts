import { NextResponse } from 'next/server'
import { requireUser, assertSameOrigin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (user.role !== 'ADMIN' || !assertSameOrigin(request)) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const { id } = await context.params
  const body = await request.json().catch(() => null)
  if (!body || !['APPROVE', 'REJECT', 'SUSPEND'].includes(body.action)) return NextResponse.json({ error: '요청을 확인해주세요.' }, { status: 400 })
  if (id === user.id) return NextResponse.json({ error: '본인 계정은 변경할 수 없어요.' }, { status: 403 })
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target || (body.action === 'SUSPEND' ? target.status !== 'ACTIVE' : target.status !== 'PENDING')) return NextResponse.json({ error: '처리할 신청이 없어요.' }, { status: 404 })
  if (target.role === 'ADMIN') return NextResponse.json({ error: '관리자 계정은 여기서 변경할 수 없어요.' }, { status: 403 })
  const status = body.action === 'APPROVE' ? 'ACTIVE' : body.action === 'REJECT' ? 'REJECTED' : 'SUSPENDED'
  const changed = await prisma.$transaction(async tx => {
    const result = await tx.user.updateMany({ where: { id, status: target.status, role: 'USER' }, data: { status, approvedById: user.id, approvedAt: status === 'ACTIVE' ? new Date() : target.approvedAt } })
    if (!result.count) return false
    if (status === 'SUSPENDED') await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
    await tx.auditEvent.create({ data: { actorId: user.id, targetId: id, action: `USER_${body.action}` } })
    return true
  })
  return changed ? NextResponse.json({ status }) : NextResponse.json({ error: '이미 처리된 신청이에요.' }, { status: 409 })
}
