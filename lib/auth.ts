import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const cookieName = 'freshkeep_session'
export function digest(value: string) { return createHash('sha256').update(value).digest('hex') }
export function randomToken() { return randomBytes(32).toString('base64url') }
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    const expected = process.env.APP_ORIGIN || new URL(request.url).origin
    return new URL(origin).origin === expected
  } catch { return false }
}
export async function requireUser() {
  const token = (await cookies()).get(cookieName)?.value
  if (!token) return null
  const session = await prisma.session.findUnique({ where: { tokenHash: digest(token) }, include: { user: true } })
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') return null
  const member = await prisma.householdMembership.findFirst({ where: { userId: session.userId, status: 'ACTIVE' }, include: { household: true } })
  return { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role, householdId: member?.householdId ?? null, household: member?.household ?? null }
}
export async function requireHousehold() {
  const user = await requireUser()
  return user?.householdId ? { ...user, householdId: user.householdId } : null
}
export async function createSession(userId: string) {
  const token = randomToken()
  await prisma.session.create({ data: { tokenHash: digest(token), userId, expiresAt: new Date(Date.now() + 14 * 86400000) } })
  ;(await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 14 * 86400 })
}
export async function endSession() {
  const store = await cookies()
  const token = store.get(cookieName)?.value
  if (token) await prisma.session.updateMany({ where: { tokenHash: digest(token) }, data: { revokedAt: new Date() } })
  store.delete(cookieName)
}
export async function revokeSessions(userId: string) { await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }) }
