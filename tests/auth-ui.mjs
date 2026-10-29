import { chromium } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.TEST_URL || 'http://localhost:3002'
mkdirSync('qa-output', { recursive: true })
const browser = await chromium.launch()
try {
  const admin = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  const password = readFileSync(process.env.TEST_ADMIN_PASSWORD_FILE || '/tmp/freshkeep-test-admin-secret','utf8').trim()
  const login = await admin.request.post(`${base}/api/auth/login`, { headers: { Origin: base }, data: { email: 'admin@freshkeep.test', password } })
  assert.equal(login.status(), 200, await login.text())
  const page = await admin.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await page.getByText('보관 중인 식재료').waitFor()
  await page.screenshot({ path: 'qa-output/auth-home-mobile.png' })
  await page.goto(`${base}/family`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: '기존 냉장고' }).waitFor()
  await page.screenshot({ path: 'qa-output/family-mobile.png' })
  await page.goto(`${base}/admin`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: '가입 신청 관리' }).waitFor()
  await page.screenshot({ path: 'qa-output/admin-mobile.png' })
  const loginPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await loginPage.goto(`${base}/login`, { waitUntil: 'networkidle' })
  await loginPage.screenshot({ path: 'qa-output/login-mobile.png' })
  await loginPage.goto(`${base}/signup`, { waitUntil: 'networkidle' })
  await loginPage.screenshot({ path: 'qa-output/signup-mobile.png' })
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const desktop = await desktopContext.newPage()
  await desktopContext.addCookies(await admin.cookies())
  await desktop.goto(base, { waitUntil: 'networkidle' })
  await desktop.screenshot({ path: 'qa-output/auth-home-desktop.png' })
  for (const candidate of [page, desktop, loginPage]) {
    const widths = await candidate.evaluate(() => ({ inner: window.innerWidth, page: document.documentElement.scrollWidth }))
    assert.ok(widths.page <= widths.inner + 1, JSON.stringify(widths))
  }
  console.log('PASS UI mobile+desktop auth screens, family/admin and no horizontal overflow')
} finally { await browser.close() }
