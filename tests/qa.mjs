import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const base = process.env.TEST_URL || 'http://localhost:3002'
mkdirSync('qa-output', { recursive: true })
const browser = await chromium.launch({ headless: true })
const errors = []
const today = new Date()
const dateString = new Date(today.getTime() + 5 * 86400000).toISOString().slice(0, 10)
const testName = `QA당근-${Date.now()}`
try {
  for (const width of [360, 390, 430, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1280 ? 900 : 844 }, deviceScaleFactor: 1, isMobile: width < 1280, hasTouch: width < 1280 })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(`${width}: ${error.message}`))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.getByText('보관 중인 식재료').waitFor()
    const metrics = await page.evaluate(() => ({ width: window.innerWidth, documentWidth: document.documentElement.scrollWidth, cardRadius: getComputedStyle(document.querySelector('section.rounded-\\[26px\\]') || document.querySelector('section')).borderRadius, navVisible: [...document.querySelectorAll('nav')].filter(x => getComputedStyle(x).display !== 'none').length }))
    if (metrics.documentWidth > width + 1) throw Error(`horizontal overflow at ${width}: ${JSON.stringify(metrics)}`)
    if (metrics.cardRadius === '0px') throw Error(`unstyled hero at ${width}`)
    await page.screenshot({ path: `qa-output/home-${width}.png`, fullPage: true })
    if (width === 390) await page.screenshot({ path: 'qa-output/home-fold-390.png' })
    console.log('LAYOUT', JSON.stringify(metrics))
    if (width === 1280) {
      await page.getByRole('button', { name: '냉장고', exact: true }).first().click()
      await page.getByRole('button', { name: '재료 등록' }).click()
      await page.screenshot({ path: 'qa-output/register-1280.png' })
      await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
    }
    if (width === 390) {
      await page.getByRole('button', { name: '식재료 등록', exact: true }).first().click()
      await page.getByLabel('식재료 이름').fill(testName)
      await page.getByRole('button', { name: '김치냉장고' }).click()
      await page.getByLabel('재료 종류').selectOption('KIMCHI')
      await page.getByLabel('유통기한').fill(dateString)
      await page.screenshot({ path: 'qa-output/register-390.png' })
      await page.getByRole('button', { name: '등록하기' }).click()
      await page.getByText(testName).waitFor()
      await page.getByRole('button', { name: '김치냉장고' }).first().click()
      await page.getByText(testName).waitFor()
      await page.screenshot({ path: 'qa-output/inventory-390.png', fullPage: true })
      await page.getByRole('button', { name: '장보기', exact: true }).last().click()
      await page.getByRole('textbox', { name: '장볼 식재료' }).fill('대파')
      await page.getByRole('button', { name: '추가', exact: true }).click()
      await page.getByText('대파', { exact: true }).waitFor()
      await page.reload({ waitUntil: 'networkidle' })
      await page.getByRole('button', { name: '장보기', exact: true }).last().click()
      await page.getByText('대파', { exact: true }).waitFor()
      await page.getByRole('button', { name: '대파 구매 체크' }).click()
      await page.screenshot({ path: 'qa-output/shopping-390.png' })
      await page.getByRole('button', { name: '대파 삭제' }).click()
      await page.getByRole('button', { name: '요리', exact: true }).last().click()
      await page.getByRole('heading', { name: '김치볶음밥' }).waitFor()
      await page.screenshot({ path: 'qa-output/recipes-390.png' })
      await page.getByRole('button', { name: '밥 장보기에 담기' }).first().click()
      await page.getByText('밥', { exact: true }).waitFor()
      await page.getByRole('button', { name: '밥 삭제' }).click()
      await page.getByRole('button', { name: '냉장고', exact: true }).last().click()
      page.once('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: `${testName} 목록에서 제거` }).click()
      await page.getByRole('button', { name: `${testName} 목록에서 제거` }).waitFor({ state: 'detached' })
    }
    await context.close()
  }
  const failure = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await failure.route('**/api/items', route => route.fulfill({ status: 503, body: '{"error":"unavailable"}', contentType: 'application/json' }))
  await failure.goto(base, { waitUntil: 'networkidle' })
  await failure.getByRole('alert').getByText('식재료를 불러오지 못했어요. 잠시 후 다시 시도해주세요.').waitFor()
  if (await failure.getByText('보관 중인 식재료').count()) throw Error('load error shown as empty inventory')
  await failure.close()
  if (errors.length) throw Error(`JS errors ${errors.join('; ')}`)
  console.log('PASS: responsive, register, filter, shopping persistence, recipe, delete, error state; no page errors')
} finally { await browser.close() }
