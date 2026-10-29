import { NextResponse } from 'next/server'
import { assertSameOrigin, endSession } from '@/lib/auth'
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인할 수 없어요.' }, { status: 403 })
  await endSession()
  return NextResponse.json({ ok: true })
}
