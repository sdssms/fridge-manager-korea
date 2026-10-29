import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const browser = await chromium.launch()
try {
  const context = await browser.newContext()
  const origin = { Origin: 'https://fridge.ian-rounge.store' }
  const base = 'http://localhost:3001'
  assert.equal((await context.request.get(`${base}/api/items`)).status(), 401)
  const login = await context.request.post(`${base}/api/auth/login`, { headers: origin, data: { email: 'admin@ian-rounge.store', password: readFileSync('/Users/sms/.freshkeep/admin-password', 'utf8').trim() } })
  assert.equal(login.status(), 200, `bootstrap admin login ${login.status()}`)
  const items = await context.request.get(`${base}/api/items`)
  assert.equal(items.status(), 200, `owned stock ${items.status()}`)
  const data = await items.json()
  assert.ok(data.length >= 6, `legacy stock preserved, got ${data.length}`)
  const me = await context.request.get(`${base}/api/auth/me`)
  assert.equal((await me.json()).user.role, 'ADMIN')
  assert.equal((await context.request.post(`${base}/api/auth/logout`, { headers: origin })).status(), 200)
  assert.equal((await context.request.get(`${base}/api/items`)).status(), 401)
  console.log('PASS production admin login, legacy 6 items, logout and anonymous isolation')
  await context.close()
} finally { await browser.close() }
