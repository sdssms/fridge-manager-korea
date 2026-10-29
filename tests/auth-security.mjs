import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.TEST_URL || 'http://localhost:3002'
const browser = await chromium.launch()
const origin = { Origin: base }
const suffix = Date.now()
async function post(api, path, data) { return api.post(`${base}${path}`, { headers: origin, data }) }
async function check(response, expected, label) { assert.equal(response.status(), expected, `${label}: ${await response.text()}`); return response.json() }
try {
  const anon = await browser.newContext(), a = await browser.newContext(), b = await browser.newContext(), c = await browser.newContext(), admin = await browser.newContext()
  const api = anon.request
  await check(await api.get(`${base}/api/items`), 401, 'anonymous items')
  await check(await api.get(`${base}/api/fridges`), 401, 'anonymous fridges')
  await check(await post(api, '/api/items', { name: 'forbidden' }), 401, 'anonymous item write')
  await check(await api.get(`${base}/api/shopping`), 401, 'anonymous shopping')
  await check(await api.get(`${base}/api/admin/requests`), 401, 'anonymous admin')
  await check(await post(api, '/api/items/bulk', { items: [{ name: 'forbidden', category: 'ETC', fridgeType: 'NORMAL_FRIDGE' }] }), 401, 'anonymous bulk write')
  const password = 'StrongPass-9082!'
  const users = [a,b,c].map((context, n) => ({ context, email: `authqa-${suffix}-${n}@example.test` }))
  for (const { context, email } of users) {
    await check(await post(context.request, '/api/auth/register', { name: `QA 사용자 ${email.at(-14)}`, email, password }), 201, 'register')
    await check(await post(context.request, '/api/auth/login', { email, password }), 403, 'pending login rejected')
  }
  const adminPassword = readFileSync(process.env.TEST_ADMIN_PASSWORD_FILE || '/tmp/freshkeep-test-admin-secret', 'utf8').trim()
  await check(await post(admin.request, '/api/auth/login', { email: 'admin@freshkeep.test', password: adminPassword }), 200, 'admin login')
  const pending = await check(await admin.request.get(`${base}/api/admin/requests`), 200, 'admin list')
  for (const { email } of users) {
    const id = pending.find(x => x.email === email)?.id
    assert.ok(id, 'signup appears in admin approval queue')
    await check(await post(admin.request, `/api/admin/requests/${id}`, { action: 'APPROVE' }), 200, 'admin approval')
  }
  for (const { context, email } of users) {
    await check(await post(context.request, '/api/auth/login', { email, password }), 200, 'approved login')
    await check(await context.request.get(`${base}/api/items`), 403, 'no group yet')
    await check(await context.request.get(`${base}/api/admin/requests`), 403, 'nonadmin admin API')
  }
  const A = a.request, B = b.request, C = c.request
  await check(await post(A, '/api/households', { name: 'QA 가족 A' }), 201, 'family create A')
  await check(await post(C, '/api/households', { name: 'QA 가족 C' }), 201, 'family create C')
  const invitation = await check(await post(A, '/api/households/invitations', {}), 201, 'invitation')
  await check(await B.get(`${base}/api/items`), 403, 'code holder not authorized before join')
  const join = await check(await post(B, '/api/households/join', { code: invitation.code }), 201, 'join request')
  await check(await B.get(`${base}/api/items`), 403, 'join pending cannot read')
  const list = await check(await A.get(`${base}/api/households/requests`), 200, 'family pending list')
  assert.ok(list.some(x => x.id === join.id), 'join visible to member')
  await check(await post(C, `/api/households/requests/${join.id}`, { action: 'APPROVE' }), 404, 'other family cannot approve')
  await check(await post(A, `/api/households/requests/${join.id}`, { action: 'APPROVE' }), 200, 'family approves')
  const payload = { name: `QA당근-${suffix}`, category: 'VEGETABLE_FRUIT', fridgeType: 'NORMAL_FRIDGE', expiryDate: null, quantity: 3, unit: '개' }
  const item = await check(await post(A, '/api/items', payload), 201, 'create shared item')
  const bulkPayload = { items: [
    { name: `QA벌크양파-${suffix}`, category: 'VEGETABLE_FRUIT', fridgeType: 'NORMAL_FRIDGE', quantity: 5, unit: '개' },
    { name: `QA벌크계란-${suffix}`, category: 'DAIRY', fridgeType: 'NORMAL_FRIDGE', expiryDate: null },
    { name: `QA벌크김치-${suffix}`, category: 'KIMCHI', fridgeType: 'KIMCHI_FRIDGE', quantity: 1, unit: '통' },
    { name: `QA벌크참치캔-${suffix}`, category: 'ETC', fridgeType: 'PANTRY', quantity: 2, unit: '개' },
  ] }
  const bulkResult = await check(await post(A, '/api/items/bulk', bulkPayload), 201, 'bulk create')
  assert.equal(bulkResult.created, 4, 'bulk created count matches request')
  const afterBulk = await check(await B.get(`${base}/api/items`), 200, 'bulk items visible to household member')
  for (const entry of bulkPayload.items) assert.ok(afterBulk.some(x => x.name === entry.name), `bulk item ${entry.name} visible`)
  await check(await post(C, '/api/items/bulk', { items: [{ name: 'other household bulk', category: 'ETC', fridgeType: 'NORMAL_FRIDGE' }] }), 201, 'bulk create other household')
  const crossCheck = await check(await B.get(`${base}/api/items`), 200, 'household B after other bulk')
  assert.ok(!crossCheck.some(x => x.name === 'other household bulk'), 'other household bulk items stay isolated')
  await check(await post(A, '/api/items/bulk', { items: [] }), 400, 'bulk rejects empty list')
  await check(await post(A, '/api/items/bulk', { items: [{ name: 'bad category', category: 'NOT_REAL', fridgeType: 'NORMAL_FRIDGE' }] }), 400, 'bulk rejects invalid category')
  await check(await post(A, '/api/items/bulk', { items: Array.from({ length: 201 }, (_, i) => ({ name: `over-${i}`, category: 'ETC', fridgeType: 'NORMAL_FRIDGE' })) }), 400, 'bulk rejects over 200 items')
  const visible = await check(await B.get(`${base}/api/items`), 200, 'second member sees shared item')
  assert.ok(visible.some(x => x.id === item.id), 'shared family inventory')
  const stranger = await check(await C.get(`${base}/api/items`), 200, 'other family list')
  assert.ok(!stranger.some(x => x.id === item.id), 'cross family hidden')
  await check(await C.delete(`${base}/api/items/${item.id}`, { headers: origin }), 404, 'cross family delete denied')
  await check(await C.patch(`${base}/api/items/${item.id}`, { headers: origin, data: { name: 'stolen' } }), 404, 'cross family update denied')
  await check(await B.put(`${base}/api/items/${item.id}/meta`, { headers: origin, data: { cookingPurpose: '내일 샐러드', personalNote: '내 메모', plannedQuantity: 2 } }), 200, 'private plan')
  const onlyA = await check(await A.get(`${base}/api/items/${item.id}/meta`), 200, 'member private meta')
  assert.equal(onlyA, null, 'other family member cannot view private metadata')
  const bought = await check(await post(A, '/api/shopping', { name: '대파' }), 201, 'shared shopping')
  assert.ok((await check(await B.get(`${base}/api/shopping`), 200, 'shopping read')).some(x => x.id === bought.id))
  await check(await C.delete(`${base}/api/shopping/${bought.id}`, { headers: origin }), 404, 'other family shopping delete')
  await check(await B.patch(`${base}/api/shopping/${bought.id}`, { headers: origin, data: { checked: true } }), 200, 'shopping check')
  await check(await B.delete(`${base}/api/items/${item.id}`, { headers: origin }), 200, 'member deletes shared item')
  await check(await post(B, '/api/households/leave', {}), 200, 'member leaves family')
  await check(await B.get(`${base}/api/items`), 401, 'left member session revoked')
  await check(await post(B, '/api/auth/login', { email: users[1].email, password }), 200, 'left member logs in again')
  await check(await B.get(`${base}/api/items`), 403, 'left member cannot access old family')
  await check(await post(A, '/api/households/leave', {}), 409, 'last active member cannot leave')
  const aUser = (await check(await A.get(`${base}/api/auth/me`), 200, 'account A')).user
  await check(await post(admin.request, `/api/admin/requests/${aUser.id}`, { action: 'SUSPEND' }), 200, 'suspend user')
  await check(await A.get(`${base}/api/items`), 401, 'suspended session revoked')
  console.log('PASS security/approval/households/invite/shared stock/private meta/shopping/suspend')
  for (const context of [anon,a,b,c,admin]) await context.close()
} finally { await browser.close() }
