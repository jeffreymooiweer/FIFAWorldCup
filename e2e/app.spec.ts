import { test, expect } from '@playwright/test'

test('loads bracket with header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.header__title-year')).toHaveText('2026')
})

test('deep link opens group in URL', async ({ page }) => {
  await page.goto('/?groep=A&year=2026')
  await expect(page).toHaveURL(/groep=A/)
})

test('year stepper switches edition', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.app-dock__year-value')).toHaveText('2026')
  await expect(page.locator('.app-dock__year-btn').last()).toBeEnabled()
  await page.locator('.app-dock__year-btn').last().click()
  await expect(page.locator('.header__title-year')).toHaveText('2022')
  await expect(page.locator('.app-dock__year-value')).toHaveText('2022')
})
