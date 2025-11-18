/**
 * Demo Details E2E Test
 * Tests demo scheduling, outcome tracking, and data persistence
 */

import { test, expect } from '@playwright/test'

test.describe('Demo Details Flow', () => {
  let leadId: string

  test.beforeEach(async ({ page }) => {
    // Create a test lead first
    await page.goto('http://localhost:5173')

    // Fill out and submit lead form
    await page.fill('input[id="companyName"]', `DemoTest Corp ${Date.now()}`)
    await page.fill('input[id="contactName"]', 'Demo Prospect')
    await page.fill('input[id="email"]', `demo+${Date.now()}@test.com`)
    await page.fill('input[id="phone"]', '555-DEMO-TST')
    await page.click('button[type="submit"]')

    // Wait for success and lead to appear
    await expect(page.locator('text=Lead created successfully!')).toBeVisible({ timeout: 10000 })

    // Click on the lead to go to detail page
    await page.click(`text=DemoTest Corp`)

    // Wait for detail page to load
    await expect(page.locator('h1')).toContainText('DemoTest Corp')

    // Extract lead ID from URL
    const url = page.url()
    const match = url.match(/\/leads\/([^/?]+)/)
    if (match) {
      leadId = match[1]
    }
  })

  test('should schedule a demo', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Wait for demo form to be visible
    await expect(page.locator('text=Demo Details')).toBeVisible()

    // Get a future date for demo (tomorrow at 2pm)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    const demoDateTime = tomorrow.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM

    // Fill demo form
    await page.fill('input[id="demoDate"]', demoDateTime)
    await page.selectOption('select[id="demoType"]', 'ONLINE')
    await page.fill('input[id="attendees"]', 'John CEO, Jane CTO')
    await page.fill('input[id="userCountEstimate"]', '50')
    await page.check('input[id="followUpRequired"]')
    await page.fill('textarea[id="notes"]', 'Interested in enterprise features')

    // Submit the form
    await page.click('button:has-text("Save Demo Details")')

    // Wait for success message
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })
  })

  test('should persist demo data after page refresh', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Get a future date
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(10, 30, 0, 0)
    const demoDateTime = nextWeek.toISOString().slice(0, 16)

    // Fill and submit demo form
    await page.fill('input[id="demoDate"]', demoDateTime)
    await page.selectOption('select[id="demoType"]', 'IN_PERSON')
    await page.fill('input[id="attendees"]', 'Executive team')
    await page.fill('input[id="userCountEstimate"]', '100')
    await page.click('button:has-text("Save Demo Details")')

    // Wait for success
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })

    // Refresh the page
    await page.reload()

    // Navigate back to Demo tab
    await page.click('button:has-text("Demo")')

    // Verify data persisted
    await expect(page.locator('input[id="demoDate"]')).toHaveValue(demoDateTime)
    await expect(page.locator('select[id="demoType"]')).toHaveValue('IN_PERSON')
    await expect(page.locator('input[id="attendees"]')).toHaveValue('Executive team')
    await expect(page.locator('input[id="userCountEstimate"]')).toHaveValue('100')
  })

  test('should show demo outcome field for past demos', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Set a past date for the demo (yesterday)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(14, 0, 0, 0)
    const pastDemoDateTime = yesterday.toISOString().slice(0, 16)

    // Fill demo date with past date
    await page.fill('input[id="demoDate"]', pastDemoDateTime)

    // Demo outcome field should appear for past demos
    await expect(page.locator('select[id="demoOutcome"]')).toBeVisible()

    // Select an outcome
    await page.selectOption('select[id="demoOutcome"]', 'POSITIVE')
    await page.fill('textarea[id="notes"]', 'Great demo, they loved the features')

    // Submit
    await page.click('button:has-text("Save Demo Details")')
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })
  })

  test('should update demo outcome after demo completes', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Schedule a demo for tomorrow first
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(15, 0, 0, 0)
    const futureDateTime = tomorrow.toISOString().slice(0, 16)

    await page.fill('input[id="demoDate"]', futureDateTime)
    await page.selectOption('select[id="demoType"]', 'HYBRID')
    await page.fill('input[id="attendees"]', 'Sales team')
    await page.click('button:has-text("Save Demo Details")')
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })

    // Now change to a past date (simulate demo happening)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(15, 0, 0, 0)
    const pastDateTime = yesterday.toISOString().slice(0, 16)

    await page.fill('input[id="demoDate"]', pastDateTime)

    // Outcome field should now be visible
    await expect(page.locator('select[id="demoOutcome"]')).toBeVisible()

    // Record outcome
    await page.selectOption('select[id="demoOutcome"]', 'POSITIVE')
    await page.fill('textarea[id="notes"]', 'Excellent presentation, moving to proposal stage')

    // Submit
    await page.click('button:has-text("Save Demo Details")')
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })

    // Refresh and verify outcome persisted
    await page.reload()
    await page.click('button:has-text("Demo")')
    await expect(page.locator('select[id="demoOutcome"]')).toHaveValue('POSITIVE')
  })

  test('should show validation error for missing demo date', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Try to submit without demo date (required field)
    await page.fill('input[id="attendees"]', 'Test attendees')
    await page.click('button:has-text("Save Demo Details")')

    // Browser validation should prevent submission or server should reject
    // The demo date field should be marked as required
    const demoDateInput = page.locator('input[id="demoDate"]')
    await expect(demoDateInput).toHaveAttribute('required', '')
  })

  test('should allow updating existing demo details', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Submit initial demo
    const date1 = new Date()
    date1.setDate(date1.getDate() + 3)
    date1.setHours(10, 0, 0, 0)
    const datetime1 = date1.toISOString().slice(0, 16)

    await page.fill('input[id="demoDate"]', datetime1)
    await page.selectOption('select[id="demoType"]', 'ONLINE')
    await page.fill('input[id="userCountEstimate"]', '25')
    await page.click('button:has-text("Save Demo Details")')
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })

    // Update the demo
    const date2 = new Date()
    date2.setDate(date2.getDate() + 5)
    date2.setHours(14, 0, 0, 0)
    const datetime2 = date2.toISOString().slice(0, 16)

    await page.fill('input[id="demoDate"]', datetime2)
    await page.selectOption('select[id="demoType"]', 'IN_PERSON')
    await page.fill('input[id="userCountEstimate"]', '75')
    await page.click('button:has-text("Save Demo Details")')
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })

    // Verify updated data persisted
    await page.reload()
    await page.click('button:has-text("Demo")')
    await expect(page.locator('input[id="demoDate"]')).toHaveValue(datetime2)
    await expect(page.locator('select[id="demoType"]')).toHaveValue('IN_PERSON')
    await expect(page.locator('input[id="userCountEstimate"]')).toHaveValue('75')
  })

  test('should handle follow-up required checkbox', async ({ page }) => {
    // Navigate to Demo tab
    await page.click('button:has-text("Demo")')

    // Schedule demo with follow-up required
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(11, 0, 0, 0)
    const demoDateTime = nextWeek.toISOString().slice(0, 16)

    await page.fill('input[id="demoDate"]', demoDateTime)
    await page.check('input[id="followUpRequired"]')
    await page.click('button:has-text("Save Demo Details")')
    await expect(page.locator('text=Demo details saved successfully!')).toBeVisible({ timeout: 10000 })

    // Verify checkbox state persisted
    await page.reload()
    await page.click('button:has-text("Demo")')
    await expect(page.locator('input[id="followUpRequired"]')).toBeChecked()
  })
})
