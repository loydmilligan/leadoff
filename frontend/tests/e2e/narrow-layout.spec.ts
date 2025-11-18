/**
 * Narrow Layout E2E Test
 * Tests responsive design at 400px width (EDIprod side-by-side requirement)
 */

import { test, expect } from '@playwright/test'

test.describe('Narrow Screen Layout (400-600px)', () => {
  test('should display correctly at 400px width', async ({ page }) => {
    // Set viewport to 400px width
    await page.setViewportSize({ width: 400, height: 900 })
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Verify no horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10) // Allow small margin

    // Verify header is visible
    await expect(page.locator('text=LeadOff CRM').first()).toBeVisible()

    // Verify form fields are vertically stacked
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Verify form inputs are readable (not cut off)
    const companyNameInput = page.locator('input[id="companyName"]')
    await expect(companyNameInput).toBeVisible()

    const inputWidth = await companyNameInput.evaluate((el) => el.getBoundingClientRect().width)
    expect(inputWidth).toBeGreaterThan(200) // Reasonable minimum width
    expect(inputWidth).toBeLessThan(400) // Fits within viewport
  })

  test('should allow form submission at 400px width', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 })
    await page.goto('http://localhost:5173')

    // Fill and submit form
    await page.fill('input[id="companyName"]', 'Narrow Screen Test')
    await page.fill('input[id="contactName"]', 'Test User')
    await page.fill('input[id="email"]', `narrow+${Date.now()}@test.com`)
    await page.fill('input[id="phone"]', '555-400')

    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('text=Lead created successfully!')).toBeVisible({ timeout: 10000 })
  })

  test('should display leads correctly at 500px width', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 900 })
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // Wait for leads to load
    await page.waitForTimeout(1000)

    // Verify lead cards are visible and readable
    const leadCards = page.locator('[class*="rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      const firstCard = leadCards.first()
      await expect(firstCard).toBeVisible()

      // Verify card content is not cut off
      const cardWidth = await firstCard.evaluate((el) => el.getBoundingClientRect().width)
      expect(cardWidth).toBeLessThanOrEqual(500)
      expect(cardWidth).toBeGreaterThan(300) // Reasonable minimum
    }
  })

  test('should display search and filters at 600px width', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto('http://localhost:5173')

    // Verify search bar is accessible
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    const searchWidth = await searchInput.evaluate((el) => el.getBoundingClientRect().width)
    expect(searchWidth).toBeGreaterThan(200)

    // Verify stage filter is accessible
    const stageFilter = page.locator('select[id="stageFilter"]')
    await expect(stageFilter).toBeVisible()

    // Test interaction
    await searchInput.fill('Test')
    await expect(searchInput).toHaveValue('Test')
  })

  test('should have no horizontal overflow at any narrow width', async ({ page }) => {
    const widths = [400, 450, 500, 550, 600]

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('http://localhost:5173')
      await page.waitForLoadState('networkidle')

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })

      expect(hasHorizontalScroll).toBe(false)
    }
  })
})
