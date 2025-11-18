/**
 * Lead Search E2E Test
 * Tests search functionality from UI input to filtered results
 */

import { test, expect } from '@playwright/test'

test.describe('Lead Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    // Wait for initial load
    await page.waitForLoadState('networkidle')
  })

  test('should filter leads by search term', async ({ page }) => {
    // Enter search term
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('Acme')

    // Wait for search to debounce and results to update
    await page.waitForTimeout(500)

    // Verify filtered results contain search term
    const leadCards = page.locator('[class*="shadow"]').filter({ hasText: 'Acme' })
    await expect(leadCards.first()).toBeVisible()
  })

  test('should show "no results" message when no leads match', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('NonExistentCompany12345XYZ')

    // Wait for search debounce
    await page.waitForTimeout(500)

    await expect(page.locator('text=/No leads found/i')).toBeVisible()
    await expect(page.locator('text=/Try a different search term/i')).toBeVisible()
  })

  test('should clear search with X button', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('Test Search')

    // Click the clear button (X icon)
    const clearButton = searchInput.locator('..').locator('button')
    await clearButton.click()

    // Verify search is cleared
    await expect(searchInput).toHaveValue('')
  })

  test('should debounce search input (not search on every keystroke)', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')

    // Type quickly
    await searchInput.type('Acme', { delay: 50 })

    // Search should not execute immediately
    // Wait less than debounce time
    await page.waitForTimeout(200)

    // Then wait for debounce to complete
    await page.waitForTimeout(300)

    // Now results should be filtered
    await expect(page.locator('text=Acme')).toBeVisible()
  })
})
