/**
 * Lead Creation E2E Test
 * Tests complete lead creation flow from form submission to list display
 */

import { test, expect } from '@playwright/test'

test.describe('Lead Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should create a new lead and display it in the list', async ({ page }) => {
    // Fill out the lead form
    await page.fill('input[id="companyName"]', 'Test Corp E2E')
    await page.fill('input[id="contactName"]', 'John Doe')
    await page.fill('input[id="contactTitle"]', 'CEO')
    await page.fill('input[id="email"]', `test+${Date.now()}@testcorp.com`) // Unique email
    await page.fill('input[id="phone"]', '555-1234-E2E')
    await page.fill('textarea[id="companyDescription"]', 'E2E test lead')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for success message
    await expect(page.locator('text=Lead created successfully!')).toBeVisible({ timeout: 10000 })

    // Verify lead appears in the list
    await expect(page.locator('text=Test Corp E2E')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=John Doe')).toBeVisible()

    // Verify the form is reset
    await expect(page.locator('input[id="companyName"]')).toHaveValue('')
  })

  test('should show validation errors for invalid inputs', async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]')

    // Check for validation messages
    await expect(page.locator('text=/Company name must be at least 2 characters/i')).toBeVisible()
    await expect(page.locator('text=/Contact name must be at least 2 characters/i')).toBeVisible()
  })

  test('should show error for invalid email', async ({ page }) => {
    await page.fill('input[id="companyName"]', 'Test Corp')
    await page.fill('input[id="contactName"]', 'John Doe')
    await page.fill('input[id="email"]', 'invalid-email')
    await page.fill('input[id="phone"]', '555-1234')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=/Invalid email format/i')).toBeVisible()
  })

  test('should disable submit button while submitting', async ({ page }) => {
    await page.fill('input[id="companyName"]', 'Test Corp')
    await page.fill('input[id="contactName"]', 'John Doe')
    await page.fill('input[id="email"]', `test+${Date.now()}@testcorp.com`)
    await page.fill('input[id="phone"]', '555-1234')

    const submitButton = page.locator('button[type="submit"]')

    await submitButton.click()

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })
})
