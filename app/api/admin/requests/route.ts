import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  const requests = await prisma.user.findMany({ where: { status: 'PENDING' }, select: { id: true, name: true, email: true, createdAt: true }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(requests, { headers: { 'Cache-Control': 'no-store' } })
}
