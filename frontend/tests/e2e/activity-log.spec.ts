/**
 * Activity Logging E2E Test
 * Tests activity logging form and history display
 */

import { test, expect } from '@playwright/test'

test.describe('Activity Logging', () => {
  test('should display activity log form on lead detail page', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard')

    // Wait for leads to load
    await page.waitForSelector('[class*="bg-white rounded-lg shadow"]', { timeout: 10000 })

    // Click on first lead card to navigate to detail page
    const leadCards = page.locator('[class*="bg-white rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      await leadCards.first().click()

      // Wait for lead detail page to load
      await page.waitForSelector('h1', { timeout: 5000 })

      // Look for activity log form heading
      const activityForm = page.locator('h3:has-text("Log Activity")')

      // Verify form is present
      await expect(activityForm).toBeVisible()

      // Verify form fields exist
      await expect(page.locator('label:has-text("Activity Type")')).toBeVisible()
      await expect(page.locator('label:has-text("Subject")')).toBeVisible()
      await expect(page.locator('label:has-text("Notes")')).toBeVisible()
    }
  })

  test('should display activity history section', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard')

    // Wait for leads to load
    await page.waitForSelector('[class*="bg-white rounded-lg shadow"]', { timeout: 10000 })

    // Click on first lead card
    const leadCards = page.locator('[class*="bg-white rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      await leadCards.first().click()

      // Wait for page load
      await page.waitForSelector('h1', { timeout: 5000 })

      // Look for Activity History heading
      const historyHeading = page.locator('h2:has-text("Activity History")')
      await expect(historyHeading).toBeVisible()
    }
  })

  test('should have required fields in activity form', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard')

    // Wait and click first lead
    await page.waitForSelector('[class*="bg-white rounded-lg shadow"]', { timeout: 10000 })
    const leadCards = page.locator('[class*="bg-white rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      await leadCards.first().click()
      await page.waitForSelector('h3:has-text("Log Activity")', { timeout: 5000 })

      // Verify Subject field has required indicator
      const subjectLabel = page.locator('label:has-text("Subject")')
      await expect(subjectLabel).toBeVisible()

      // Check for required asterisk
      const requiredIndicator = subjectLabel.locator('span:has-text("*")')
      await expect(requiredIndicator).toBeVisible()

      // Verify submit button exists
      const submitButton = page.locator('button:has-text("Log Activity")')
      await expect(submitButton).toBeVisible()
    }
  })

  test('should display back button on lead detail page', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard')

    // Wait and click first lead
    await page.waitForSelector('[class*="bg-white rounded-lg shadow"]', { timeout: 10000 })
    const leadCards = page.locator('[class*="bg-white rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      await leadCards.first().click()
      await page.waitForSelector('h1', { timeout: 5000 })

      // Look for back button
      const backButton = page.locator('button:has-text("Back to Dashboard")')
      await expect(backButton).toBeVisible()

      // Verify it navigates back
      await backButton.click()
      await page.waitForSelector('h2:has-text("Focus: Leads Requiring Attention")', { timeout: 5000 })
      await expect(page).toHaveURL(/dashboard/)
    }
  })

  test('should show lead details on detail page', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard')

    // Wait and click first lead
    await page.waitForSelector('[class*="bg-white rounded-lg shadow"]', { timeout: 10000 })
    const leadCards = page.locator('[class*="bg-white rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      await leadCards.first().click()
      await page.waitForSelector('h1', { timeout: 5000 })

      // Verify key sections are present
      await expect(page.locator('h3:has-text("Email")')).toBeVisible()
      await expect(page.locator('h3:has-text("Phone")')).toBeVisible()
      await expect(page.locator('h3:has-text("Stage")')).toBeVisible()

      // Verify follow-up indicator is present
      const followUpIndicator = page.locator('span[data-status]')
      if (await followUpIndicator.count() > 0) {
        await expect(followUpIndicator.first()).toBeVisible()
      }
    }
  })
})
