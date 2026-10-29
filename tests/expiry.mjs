import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const base = process.env.TEST_URL || 'http://localhost:3002'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const api = context.request
const origin = { Origin: base }
const password = readFileSync(process.env.TEST_ADMIN_PASSWORD_FILE || '/tmp/freshkeep-test-admin-secret', 'utf8').trim()
const dateInSeoul = (offset) => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const d = new Date(`${today}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}
const made = []
try {
  const login = await api.post(`${base}/api/auth/login`, { headers: origin, data: { email: 'admin@freshkeep.test', password } })
  assert.equal(login.status(), 200, `login ${await login.text()}`)
  const marker = `QA기한-${Date.now()}`
  for (const [label, offset] of [['지난재료', -2], ['오늘재료', 0], ['곧재료', 2], ['나중재료', 7]]) {
    const response = await api.post(`${base}/api/items`, { headers: origin, data: { name: `${marker}-${label}`, category: 'ETC', fridgeType: 'NORMAL_FRIDGE', expiryDate: dateInSeoul(offset), quantity: null, unit: null } })
    assert.equal(response.status(), 201, `${label}: ${await response.text()}`)
    made.push(await response.json())
  }
  const items = await api.get(`${base}/api/items`)
  assert.equal(items.status(), 200)
  const byName = new Map((await items.json()).map(i => [i.name, i]))
  for (const [label, offset] of [['지난재료', -2], ['오늘재료', 0], ['곧재료', 2], ['나중재료', 7]]) {
    assert.equal(byName.get(`${marker}-${label}`)?.dday, offset, `${label} calendar-day calculation`)
  }
  const page = await context.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /우리 가족 냉장고/ }).waitFor()
  assert.match(await page.locator('main').innerText(), /폐기 대상/, 'overdue stock must be separately visible as 폐기 대상')
  const overdueCard = page.getByRole('button', { name: /폐기 대상/ })
  assert.match(await overdueCard.innerText(), /1개/, 'only overdue items are counted; today and soon are not overdue')
  assert.match(await page.getByText('3일 안에 확인', { exact: true }).locator('..').innerText(), /2개/, 'today and two-days-away are upcoming')
  assert.match(await page.getByText('이번 주 안에 확인', { exact: true }).locator('..').innerText(), /1개/)
  await overdueCard.click()
  const inventory = page.locator('main')
  assert.match(await inventory.innerText(), /기한 2일 지남/, 'overdue row clearly says deadline passed')
  const inventoryText = await inventory.innerText()
  assert.ok(inventoryText.includes(`${marker}-지난재료`), inventoryText)
  assert.ok(!inventoryText.includes(`${marker}-오늘재료`), 'expiry filter excludes today')
  assert.ok(!inventoryText.includes(`${marker}-곧재료`), 'expiry filter excludes upcoming')
  console.log('PASS Seoul date boundaries and expired-vs-upcoming UI grouping')
} finally {
  for (const item of made) {
    await api.delete(`${base}/api/items/${item.id}`, { headers: origin, data: { action: 'DISCARDED', discardReason: 'OTHER' } }).catch(() => {})
  }
  await context.close()
  await browser.close()
}
