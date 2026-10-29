import { prisma } from '@/lib/prisma'
import { digest } from '@/lib/auth'

/** Fixed window, server-side, persistent. Treat forwarding IP only as an additional signal. */
export async function rateLimit(request: Request, action: string, subject: string, max: number, minutes = 15) {
  const ip = (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').slice(0, 80)
  const now = new Date()
  const scope = action.endsWith('-email') || action.endsWith('-user') ? subject : ip
  const key = `${action}:${digest(scope).slice(0, 32)}`
  const resetAt = new Date(now.getTime() + minutes * 60000)
  const row = await prisma.rateLimit.upsert({ where: { key }, create: { key, count: 1, resetAt }, update: { count: { increment: 1 } } })
  if (row.resetAt <= now) {
    await prisma.rateLimit.update({ where: { key }, data: { count: 1, resetAt } })
    return true
  }
  return row.count <= max
}
