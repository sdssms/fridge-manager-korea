import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
export async function GET(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!user.householdId) return NextResponse.json({ error: '가족 가입 후 이용할 수 있어요.' }, { status: 403 })
  const url = new URL(request.url)
  const cursor = url.searchParams.get('cursor')
  const take = 30
  const events = await prisma.consumptionEvent.findMany({
    where: { householdId: user.householdId },
    orderBy: { occurredAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, itemName: true, category: true, quantity: true, unit: true, action: true, discardReason: true, occurredAt: true, actor: { select: { name: true } } },
  })
  const hasMore = events.length > take
  const page = hasMore ? events.slice(0, take) : events
  return NextResponse.json({
    events: page.map(e => ({ ...e, actorName: e.actor?.name ?? '탈퇴한 구성원' })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
