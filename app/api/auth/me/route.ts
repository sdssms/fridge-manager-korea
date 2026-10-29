import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  const joinRequest = user.householdId ? null : await prisma.joinRequest.findFirst({ where: { requesterId: user.id, status: 'PENDING' }, select: { id: true, status: true } })
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, householdId: user.householdId }, household: user.household ? { id: user.household.id, name: user.household.name } : null, joinRequest }, { headers: { 'Cache-Control': 'no-store' } })
}
