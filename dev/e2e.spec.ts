import { expect, test } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const shot = (name: string) => path.resolve(dirname, 'screenshots', name)

// One shared session. Authenticate through Payload's REST API so the auth
// cookie lives in the browser context — far more reliable than driving the
// login form through hydration timing.
test('capture admin screenshots', async ({ page }) => {
  test.setTimeout(180_000)

  const res = await page.request.post('/api/users/login', {
    data: { email: 'dev@payloadcms.com', password: 'test' },
  })
  expect(res.ok(), `login failed: ${res.status()}`).toBeTruthy()

  // 1. Dashboard
  await page.goto('/admin')
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2500)
  await page.screenshot({ path: shot('01-dashboard.png'), fullPage: true })

  // 2. Templates list view
  await page.goto('/admin/collections/email-templates')
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2500)
  await page.screenshot({ path: shot('02-templates-list.png'), fullPage: true })

  // 3. Template edit view — navigate straight to the seeded doc
  const list = await page.request.get(
    '/api/email-templates?where[key][equals]=guest-confirmation&limit=1',
  )
  const id = (await list.json()).docs[0].id
  await page.goto(`/admin/collections/email-templates/${id}`)
  await page.waitForSelector('.email-designer-trigger', { timeout: 30_000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: shot('03-template-edit.png'), fullPage: true })

  // 4. Visual designer drawer
  await page.getByRole('button', { name: /Open Email Designer|Edit email design/ }).first().click()
  await page.waitForSelector('.email-designer__body', { timeout: 30_000 })
  await page.waitForSelector('.email-designer__token', { timeout: 20_000 }).catch(() => {})
  await page.waitForTimeout(4000)
  await page.screenshot({ path: shot('04-designer-drawer.png') })

  // 5. Email settings global
  await page.goto('/admin/globals/email-settings')
  await page.waitForSelector('#field-fromName', { timeout: 30_000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: shot('05-email-settings.png'), fullPage: true })
})
