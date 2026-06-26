import { test, expect } from '@playwright/test'

test('loads bracket with header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.header__title-year')).toHaveText('2026')
})

test('deep link opens group in URL', async ({ page }) => {
  await page.goto('/?groep=A&year=2026')
  await expect(page).toHaveURL(/groep=A/)
})

test('edition selector lists past years only', async ({ page }) => {
  await page.goto('/')
  const select = page.locator('.app-toolbar__select').first()
  await expect(select.locator('option[value="2030"]')).toHaveCount(0)
  await expect(select.locator('option[value="2022"]')).toHaveCount(1)
  await select.selectOption('2022')
  await expect(page.locator('.header__title-year')).toHaveText('2022')
})
