import { test, expect } from '@playwright/test'

test('loads bracket with header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.header__title-year')).toHaveText('2026')
})

test('deep link opens group in URL', async ({ page }) => {
  await page.goto('/?groep=A&year=2026')
  await expect(page).toHaveURL(/groep=A/)
})

test('year 2002 loads without crashing', async ({ page }) => {
  page.on('pageerror', (err) => {
    throw err
  })
  await page.goto('/?year=2002')
  await expect(page.locator('.header__title-year')).toHaveText('2002', { timeout: 15000 })
  await expect(page.locator('.app-dock__year-value')).toHaveText('2002')
})

test('year stepper switches edition', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.app-dock__year-value')).toHaveText('2026')
  const olderBtn = page.locator('.app-dock__year-btn').last()
  await expect(olderBtn).toBeEnabled()
  await olderBtn.click()
  await expect(page.locator('.header__title-year')).toHaveText('2022', { timeout: 15000 })
  await expect(page.locator('.app-dock__year-value')).toHaveText('2022')
})
