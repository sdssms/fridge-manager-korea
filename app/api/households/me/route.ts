import { NextResponse } from 'next/server'
import { requireHousehold } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const user = await requireHousehold()
  if (!user) return NextResponse.json({ error: '가족 가입 후 이용할 수 있어요.' }, { status: 403 })
  const members = await prisma.householdMembership.findMany({ where: { householdId: user.householdId, status: 'ACTIVE', user: { status: 'ACTIVE' } }, select: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: 'asc' } })
  return NextResponse.json({ household: { id: user.householdId, name: user.household?.name }, members: members.map(m => m.user) }, { headers: { 'Cache-Control': 'no-store' } })
}
