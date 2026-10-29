import { NextResponse } from 'next/server'
import { requireHousehold } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const user = await requireHousehold()
  if (!user) return NextResponse.json({ error: '가족 가입 후 이용할 수 있어요.' }, { status: 403 })
  const requests = await prisma.joinRequest.findMany({ where: { householdId: user.householdId, status: 'PENDING', requester: { status: 'ACTIVE' } }, select: { id: true, createdAt: true, requester: { select: { name: true } } }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(requests.map(r => ({ id: r.id, name: r.requester.name, createdAt: r.createdAt })), { headers: { 'Cache-Control': 'no-store' } })
}
