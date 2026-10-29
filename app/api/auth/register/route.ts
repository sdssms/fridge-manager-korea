import { NextResponse } from 'next/server'
import { z } from 'zod'
import argon2 from 'argon2'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin } from '@/lib/auth'
import { rateLimit } from '@/lib/security'

const schema = z.object({ name: z.string().trim().min(2).max(50), email: z.email().max(254), password: z.string().min(12).max(128) }).strict()
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인할 수 없어요.' }, { status: 403 })
  if (!(await rateLimit(request, 'register-ip', '', 20, 60))) return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '이름, 이메일, 12자 이상의 비밀번호를 확인해주세요.' }, { status: 400 })
  const email = parsed.data.email.trim().toLowerCase()
  try {
    const passwordHash = await argon2.hash(parsed.data.password, { type: argon2.argon2id })
    await prisma.user.create({ data: { name: parsed.data.name, email, passwordHash } })
  } catch (error) {
    if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')) {
      console.error('Registration failed', error)
      return NextResponse.json({ error: '가입 신청을 처리할 수 없어요.' }, { status: 500 })
    }
  }
  return NextResponse.json({ message: '가입 신청을 접수했어요. 관리자 승인을 기다려주세요.' }, { status: 201 })
}
