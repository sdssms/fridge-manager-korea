import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertSameOrigin, digest, requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/security'
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  if (user.householdId) return NextResponse.json({ error: '이미 가족에 속해 있어요.' }, { status: 409 })
  if (!(await rateLimit(request, 'join-user', user.id, 12, 60))) return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
  const parsed = z.object({ code: z.string().min(32).max(128) }).strict().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '초대코드를 확인해주세요.' }, { status: 400 })
  const invitation = await prisma.householdInvitation.findUnique({ where: { codeHash: digest(parsed.data.code.trim()) } })
  if (!invitation || invitation.revokedAt || invitation.expiresAt <= new Date()) return NextResponse.json({ error: '유효한 초대코드가 아니에요.' }, { status: 404 })
  try {
    const result = await prisma.$transaction(async tx => {
      if (await tx.householdMembership.findFirst({ where: { userId: user.id, status: 'ACTIVE' } })) throw Error('MEMBER')
      if (await tx.joinRequest.findFirst({ where: { requesterId: user.id, status: 'PENDING' } })) throw Error('PENDING')
      return tx.joinRequest.create({ data: { householdId: invitation.householdId, requesterId: user.id } })
    })
    return NextResponse.json({ id: result.id, status: result.status }, { status: 201 })
  } catch { return NextResponse.json({ error: '이미 처리 중인 합류 신청이 있어요.' }, { status: 409 }) }
}
