import { NextResponse } from 'next/server'
import { z } from 'zod'
import argon2 from 'argon2'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, createSession } from '@/lib/auth'
import { rateLimit } from '@/lib/security'

const schema = z.object({ email: z.email(), password: z.string().min(1).max(128) }).strict()
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인할 수 없어요.' }, { status: 403 })
  if (!(await rateLimit(request, 'login-ip', '', 40)) ) return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '이메일 또는 비밀번호를 확인해주세요.' }, { status: 400 })
  const email = parsed.data.email.trim().toLowerCase()
  if (!(await rateLimit(request, 'login-email', email, 10))) return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
  const user = await prisma.user.findUnique({ where: { email } })
  const valid = user && await argon2.verify(user.passwordHash, parsed.data.password)
  if (!valid) return NextResponse.json({ error: '이메일 또는 비밀번호를 확인해주세요.' }, { status: 401 })
  if (user.status !== 'ACTIVE') return NextResponse.json({ error: user.status === 'PENDING' ? '관리자 승인 대기 중이에요.' : '이용할 수 없는 계정이에요.' }, { status: 403 })
  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } })
}
