import { test, expect } from '@playwright/test'

test.describe('Sample E2E Test', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Basic check that the page loads
    await expect(page).toHaveTitle(/LeadOff CRM|Vite/)
  })

  test('should have a functional DOM', async ({ page }) => {
    await page.goto('/')

    // Check that the root element exists
    const root = page.locator('#root')
    await expect(root).toBeVisible()
  })
})
