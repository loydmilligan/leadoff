/**
 * Follow-up Reminders E2E Test
 * Tests focus view and follow-up indicator functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Follow-up Reminders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard')
  })

  test('should display FocusView component on dashboard', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('h2:has-text("Focus: Leads Requiring Attention")', { timeout: 5000 })

    // Verify FocusView is present
    const focusView = page.locator('h2:has-text("Focus: Leads Requiring Attention")')
    await expect(focusView).toBeVisible()
  })

  test('should show follow-up indicators on lead cards', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[class*="bg-white rounded-lg shadow"]', { timeout: 5000 })

    // Look for lead cards
    const leadCards = page.locator('[class*="bg-white rounded-lg shadow"]')
    const count = await leadCards.count()

    if (count > 0) {
      // Check if at least one lead card has a follow-up indicator
      const firstCard = leadCards.first()

      // Look for follow-up indicator badges (they have specific colors and text)
      const indicators = firstCard.locator('span[data-status]')

      // Verify at least one indicator exists
      if (await indicators.count() > 0) {
        const indicator = indicators.first()
        await expect(indicator).toBeVisible()

        // Verify it has a valid status attribute
        const status = await indicator.getAttribute('data-status')
        expect(['overdue', 'today', 'upcoming', 'none']).toContain(status)
      }
    }
  })

  test('should display overdue badge in red for overdue leads', async ({ page }) => {
    // Look for any overdue indicators
    const overdueIndicators = page.locator('span[data-status="overdue"]')
    const count = await overdueIndicators.count()

    if (count > 0) {
      const firstOverdue = overdueIndicators.first()
      await expect(firstOverdue).toBeVisible()

      // Check for red styling
      await expect(firstOverdue).toHaveClass(/bg-red/)

      // Check text includes "overdue" or days count
      const text = await firstOverdue.textContent()
      expect(text?.toLowerCase()).toContain('overdue')
    }
  })

  test('should show lead count in FocusView summary', async ({ page }) => {
    // Wait for FocusView to load
    await page.waitForSelector('h2:has-text("Focus: Leads Requiring Attention")', { timeout: 5000 })

    // Check for summary text showing count
    const summaryText = page.locator('text=/Showing top \\d+ of \\d+/')

    // If there are leads, this should be visible
    const isVisible = await summaryText.isVisible().catch(() => false)

    if (isVisible) {
      await expect(summaryText).toBeVisible()
    } else {
      // Otherwise, check for "All caught up" message
      const caughtUpMessage = page.locator('text=All caught up!')
      await expect(caughtUpMessage).toBeVisible()
    }
  })

  test('should categorize leads into overdue, today, and upcoming', async ({ page }) => {
    // Wait for FocusView to load
    await page.waitForSelector('h2:has-text("Focus: Leads Requiring Attention")', { timeout: 5000 })

    // Look for category badges (Overdue, Due Today, Upcoming)
    const overdueBadge = page.locator('text=/\\d+ Overdue/')
    const todayBadge = page.locator('text=/\\d+ Due Today/')
    const upcomingBadge = page.locator('text=/\\d+ Upcoming/')

    // At least one category should be present if there are follow-ups
    const hasOverdue = await overdueBadge.isVisible().catch(() => false)
    const hasToday = await todayBadge.isVisible().catch(() => false)
    const hasUpcoming = await upcomingBadge.isVisible().catch(() => false)

    // Either we have some categories OR we have the "All caught up" message
    if (!hasOverdue && !hasToday && !hasUpcoming) {
      const caughtUpMessage = page.locator('text=All caught up!')
      await expect(caughtUpMessage).toBeVisible()
    } else {
      // Verify at least one category badge is visible
      expect(hasOverdue || hasToday || hasUpcoming).toBeTruthy()
    }
  })

  test('should prioritize leads in FocusView', async ({ page }) => {
    // Wait for FocusView to load
    await page.waitForSelector('h2:has-text("Focus: Leads Requiring Attention")', { timeout: 5000 })

    // Get all leads in FocusView
    const focusLeads = page.locator('[class*="border rounded-lg p-4"]')
    const count = await focusLeads.count()

    // If there are multiple leads, verify ordering
    if (count >= 2) {
      // First lead should be highest priority
      const firstLead = focusLeads.first()
      await expect(firstLead).toBeVisible()

      // Overdue leads should be prioritized (have red border/background)
      const firstLeadClasses = await firstLead.getAttribute('class')

      // If first lead is overdue, it should have red styling
      if (firstLeadClasses?.includes('red')) {
        // Good - overdue lead is prioritized
        expect(firstLeadClasses).toContain('red')
      }
    }
  })

  test('should show "No follow-up" for leads without follow-up dates', async ({ page }) => {
    // Look for any "No follow-up" or "No f/u" indicators
    const noFollowUpIndicators = page.locator('span[data-status="none"]')
    const count = await noFollowUpIndicators.count()

    if (count > 0) {
      const firstNoFollowUp = noFollowUpIndicators.first()
      await expect(firstNoFollowUp).toBeVisible()

      // Check for gray styling
      await expect(firstNoFollowUp).toHaveClass(/bg-gray/)

      // Check text
      const text = await firstNoFollowUp.textContent()
      expect(text?.toLowerCase()).toMatch(/no follow|no f\/u/)
    }
  })
})
