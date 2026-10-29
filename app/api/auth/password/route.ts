import { NextResponse } from 'next/server'
import { z } from 'zod'
import argon2 from 'argon2'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireUser, createSession, revokeSessions } from '@/lib/auth'
import { rateLimit } from '@/lib/security'

const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(12).max(128) }).strict()

export async function PATCH(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  if (!(await rateLimit(request, 'password-change-user', user.id, 8, 15))) return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '현재 비밀번호와 12자 이상의 새 비밀번호를 입력해주세요.' }, { status: 400 })
  if (parsed.data.currentPassword === parsed.data.newPassword) return NextResponse.json({ error: '새 비밀번호는 현재 비밀번호와 달라야 해요.' }, { status: 400 })
  const record = await prisma.user.findUnique({ where: { id: user.id } })
  if (!record) return NextResponse.json({ error: '계정을 찾을 수 없어요.' }, { status: 404 })
  const valid = await argon2.verify(record.passwordHash, parsed.data.currentPassword).catch(() => false)
  if (!valid) return NextResponse.json({ error: '현재 비밀번호가 올바르지 않아요.' }, { status: 403 })
  const passwordHash = await argon2.hash(parsed.data.newPassword, { type: argon2.argon2id })
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
  // Password change invalidates every existing session (including this one); issue a fresh session for the current device.
  await revokeSessions(user.id)
  await createSession(user.id)
  await prisma.auditEvent.create({ data: { actorId: user.id, targetId: user.id, action: 'PASSWORD_CHANGED' } })
  return NextResponse.json({ success: true })
}
