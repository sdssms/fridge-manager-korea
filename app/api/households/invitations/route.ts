import { NextResponse } from 'next/server'
import { assertSameOrigin, digest, randomToken, requireHousehold } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function POST(request: Request) {
  const user = await requireHousehold()
  if (!user) return NextResponse.json({ error: '가족 가입 후 이용할 수 있어요.' }, { status: 403 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  const code = randomToken()
  await prisma.$transaction(async tx => {
    await tx.householdInvitation.updateMany({ where: { householdId: user.householdId, revokedAt: null }, data: { revokedAt: new Date() } })
    await tx.householdInvitation.create({ data: { householdId: user.householdId, createdById: user.id, codeHash: digest(code), expiresAt: new Date(Date.now() + 7 * 86400000) } })
  })
  return NextResponse.json({ code, expiresInDays: 7 }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
