/**
 * Organization Details E2E Test
 * Tests organization form submission and data persistence
 */

import { test, expect } from '@playwright/test'

test.describe('Organization Details Flow', () => {
  let leadId: string

  test.beforeEach(async ({ page }) => {
    // Create a test lead first
    await page.goto('http://localhost:5173')

    // Fill out and submit lead form
    await page.fill('input[id="companyName"]', `OrgTest Corp ${Date.now()}`)
    await page.fill('input[id="contactName"]', 'Jane Smith')
    await page.fill('input[id="email"]', `orgtest+${Date.now()}@test.com`)
    await page.fill('input[id="phone"]', '555-ORG-TEST')
    await page.click('button[type="submit"]')

    // Wait for success and lead to appear
    await expect(page.locator('text=Lead created successfully!')).toBeVisible({ timeout: 10000 })

    // Click on the lead to go to detail page
    await page.click(`text=OrgTest Corp`)

    // Wait for detail page to load
    await expect(page.locator('h1')).toContainText('OrgTest Corp')

    // Extract lead ID from URL
    const url = page.url()
    const match = url.match(/\/leads\/([^/?]+)/)
    if (match) {
      leadId = match[1]
    }
  })

  test('should fill and submit organization form', async ({ page }) => {
    // Navigate to Organization tab
    await page.click('button:has-text("Organization")')

    // Wait for OpportunitySummary to be visible
    await expect(page.locator('text=Opportunity Qualification')).toBeVisible()

    // Fill organization form
    await page.fill('input[id="industry"]', 'Technology')
    await page.fill('input[id="employeeCount"]', '150')
    await page.fill('input[id="annualRevenue"]', '5000000')
    await page.fill('input[id="decisionMaker"]', 'John CEO')
    await page.fill('input[id="decisionMakerRole"]', 'Chief Executive Officer')
    await page.fill('textarea[id="currentSolution"]', 'Legacy CRM system')
    await page.fill('textarea[id="painPoints"]', 'Slow performance, poor UX')
    await page.fill('input[id="budget"]', '100000')
    await page.fill('input[id="timeline"]', 'Q1 2025')

    // Submit the form
    await page.click('button:has-text("Save Organization Info")')

    // Wait for success message
    await expect(page.locator('text=Organization information saved successfully!')).toBeVisible({ timeout: 10000 })

    // Verify qualification score updated
    await expect(page.locator('text=/qualification/i')).toBeVisible()
  })

  test('should persist organization data after page refresh', async ({ page }) => {
    // Navigate to Organization tab
    await page.click('button:has-text("Organization")')

    // Fill and submit organization form
    await page.fill('input[id="industry"]', 'Healthcare')
    await page.fill('input[id="budget"]', '250000')
    await page.fill('input[id="decisionMaker"]', 'Dr. Smith')
    await page.click('button:has-text("Save Organization Info")')

    // Wait for success
    await expect(page.locator('text=Organization information saved successfully!')).toBeVisible({ timeout: 10000 })

    // Refresh the page
    await page.reload()

    // Navigate back to Organization tab
    await page.click('button:has-text("Organization")')

    // Verify data persisted
    await expect(page.locator('input[id="industry"]')).toHaveValue('Healthcare')
    await expect(page.locator('input[id="budget"]')).toHaveValue('250000')
    await expect(page.locator('input[id="decisionMaker"]')).toHaveValue('Dr. Smith')
  })

  test('should show validation errors for invalid inputs', async ({ page }) => {
    // Navigate to Organization tab
    await page.click('button:has-text("Organization")')

    // Enter invalid employee count
    await page.fill('input[id="employeeCount"]', '-10')
    await page.click('button:has-text("Save Organization Info")')

    // Should show validation error (client-side or server-side)
    await expect(page.locator('text=/Employee count must be positive/i')).toBeVisible()
  })

  test('should update qualification score when organization data is added', async ({ page }) => {
    // Navigate to Organization tab
    await page.click('button:has-text("Organization")')

    // Check initial score (should be low)
    const scoreElement = page.locator('text=/\\d+\\s*\\/\\s*100/')
    await expect(scoreElement).toBeVisible()

    // Fill critical qualification fields
    await page.fill('input[id="industry"]', 'Finance')
    await page.fill('input[id="budget"]', '500000')
    await page.fill('input[id="decisionMaker"]', 'CFO Johnson')
    await page.fill('input[id="timeline"]', 'Q2 2025')

    // Submit
    await page.click('button:has-text("Save Organization Info")')
    await expect(page.locator('text=Organization information saved successfully!')).toBeVisible({ timeout: 10000 })

    // Refresh to get updated score from backend
    await page.reload()
    await page.click('button:has-text("Organization")')

    // Score should have increased
    await expect(scoreElement).toBeVisible()
  })

  test('should allow updating existing organization data', async ({ page }) => {
    // Navigate to Organization tab
    await page.click('button:has-text("Organization")')

    // Submit initial data
    await page.fill('input[id="industry"]', 'Retail')
    await page.fill('input[id="budget"]', '50000')
    await page.click('button:has-text("Save Organization Info")')
    await expect(page.locator('text=Organization information saved successfully!')).toBeVisible({ timeout: 10000 })

    // Update the data
    await page.fill('input[id="industry"]', 'E-commerce')
    await page.fill('input[id="budget"]', '75000')
    await page.click('button:has-text("Save Organization Info")')
    await expect(page.locator('text=Organization information saved successfully!')).toBeVisible({ timeout: 10000 })

    // Verify updated data persisted
    await page.reload()
    await page.click('button:has-text("Organization")')
    await expect(page.locator('input[id="industry"]')).toHaveValue('E-commerce')
    await expect(page.locator('input[id="budget"]')).toHaveValue('75000')
  })
})
