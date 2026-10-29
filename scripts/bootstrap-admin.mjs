import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import argon2 from 'argon2'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const file = process.env.ADMIN_PASSWORD_FILE
if (!email || !file || !process.env.DATABASE_URL) throw Error('ADMIN_EMAIL, ADMIN_PASSWORD_FILE and DATABASE_URL are required')
const prisma = new PrismaClient()
try {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) { console.log('Admin account already exists; no credentials changed'); process.exit(0) }
  const secret = existsSync(file) ? readFileSync(file, 'utf8').trim() : randomBytes(32).toString('base64url')
  if (secret.length < 16) throw Error('Bootstrap password must be at least 16 characters')
  if (!existsSync(file)) writeFileSync(file, `${secret}\n`, { mode: 0o600, flag: 'wx' })
  const passwordHash = await argon2.hash(secret, { type: argon2.argon2id })
  await prisma.$transaction(async tx => {
    const existingAdmin = await tx.user.count({ where: { role: 'ADMIN' } })
    if (existingAdmin) throw Error('An admin already exists; bootstrap disabled')
    const user = await tx.user.create({ data: { email, name: '관리자', role: 'ADMIN', status: 'ACTIVE', passwordHash, approvedAt: new Date() } })
    const household = await tx.household.findUnique({ where: { id: 'legacy-household' } })
    if (!household) throw Error('Legacy household missing; migration not applied')
    await tx.household.update({ where: { id: household.id }, data: { createdById: user.id } })
    await tx.householdMembership.create({ data: { userId: user.id, householdId: household.id } })
  })
  console.log(`Bootstrap admin created: ${email}; password stored in restricted file (not printed).`)
} finally { await prisma.$disconnect() }
