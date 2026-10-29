import { NextResponse } from 'next/server'
import { z } from 'zod'
import argon2 from 'argon2'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, requireHousehold, revokeSessions } from '@/lib/auth'

const schema = z.object({ confirmName: z.string().trim().min(1).max(60), password: z.string().min(1).max(128) }).strict()

/**
 * Irreversibly deletes the household: every shared fridge, food item, personal
 * cooking note tied to those items, shopping list entry, invitation, and join
 * request. Only the sole remaining active member may do this, and only after
 * retyping the exact household name and their own password — there is no undo.
 */
export async function POST(request: Request) {
  const user = await requireHousehold()
  if (!user) return NextResponse.json({ error: '가족 가입 후 이용할 수 있어요.' }, { status: 403 })
  if (!assertSameOrigin(request)) return NextResponse.json({ error: '요청 출처를 확인해주세요.' }, { status: 403 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: '가족 이름과 비밀번호를 입력해주세요.' }, { status: 400 })
  const record = await prisma.user.findUnique({ where: { id: user.id } })
  if (!record) return NextResponse.json({ error: '계정을 찾을 수 없어요.' }, { status: 404 })
  const validPassword = await argon2.verify(record.passwordHash, parsed.data.password).catch(() => false)
  if (!validPassword) return NextResponse.json({ error: '비밀번호가 올바르지 않아요.' }, { status: 403 })
  const householdId = user.householdId
  try {
    const result = await prisma.$transaction(async tx => {
      const household = await tx.household.findUnique({ where: { id: householdId } })
      if (!household) return 'NOT_FOUND' as const
      if (household.name !== parsed.data.confirmName) return 'NAME_MISMATCH' as const
      const activeMembers = await tx.householdMembership.count({ where: { householdId, status: 'ACTIVE', user: { status: 'ACTIVE' } } })
      if (activeMembers > 1) return 'NOT_SOLE_MEMBER' as const
      // food_items -> item_personal_meta cascade on fridge delete; household delete cascades memberships/invitations/join_requests/shopping_items.
      await tx.fridge.deleteMany({ where: { householdId } })
      await tx.household.delete({ where: { id: householdId } })
      await tx.auditEvent.create({ data: { actorId: user.id, targetId: householdId, action: 'HOUSEHOLD_CLOSED' } })
      return 'OK' as const
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    if (result === 'NAME_MISMATCH') return NextResponse.json({ error: '가족 이름이 일치하지 않아요.' }, { status: 400 })
    if (result === 'NOT_SOLE_MEMBER') return NextResponse.json({ error: '다른 구성원이 남아있으면 폐쇄할 수 없어요. 먼저 모두 탈퇴해주세요.' }, { status: 409 })
    if (result === 'NOT_FOUND') return NextResponse.json({ error: '가족을 찾을 수 없어요.' }, { status: 404 })
  } catch (error) {
    console.error('Failed to close household', error)
    return NextResponse.json({ error: '폐쇄하지 못했어요. 다시 시도해주세요.' }, { status: 409 })
  }
  // Closing destroys the only household this session had access to; force re-authentication everywhere.
  await revokeSessions(user.id)
  return NextResponse.json({ success: true })
}
