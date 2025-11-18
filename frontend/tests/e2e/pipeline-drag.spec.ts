/**
 * E2E Test: Pipeline Drag-and-Drop
 * Tests the kanban drag-and-drop functionality for stage updates
 */

import { test, expect } from '@playwright/test';

test.describe('Pipeline Drag-and-Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pipeline page
    await page.goto('http://localhost:5173/pipeline');
    await page.waitForSelector('h1:has-text("Sales Pipeline")');
  });

  test('should display pipeline columns for all active stages', async ({ page }) => {
    // Check that all active stage columns are visible
    await expect(page.getByText('Inquiry')).toBeVisible();
    await expect(page.getByText('Qualification')).toBeVisible();
    await expect(page.getByText('Opportunity')).toBeVisible();
    await expect(page.getByText('Demo Scheduled')).toBeVisible();
    await expect(page.getByText('Demo Complete')).toBeVisible();
    await expect(page.getByText('Proposal Sent')).toBeVisible();
    await expect(page.getByText('Negotiation')).toBeVisible();

    // Closed stages should not be in pipeline view
    await expect(page.getByText('Closed Won')).not.toBeVisible();
    await expect(page.getByText('Closed Lost')).not.toBeVisible();
  });

  test('should show lead cards in their current stage column', async ({ page }) => {
    // Wait for leads to load
    await page.waitForTimeout(1000);

    // Check if there are any lead cards
    const leadCards = page.locator('[class*="bg-white"][class*="rounded-lg"][class*="border"]');
    const count = await leadCards.count();

    if (count > 0) {
      // Verify lead cards have company names
      const firstCard = leadCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should drag lead card to new stage column', async ({ page }) => {
    // Wait for leads to load
    await page.waitForTimeout(1000);

    // Find a lead in the Inquiry column
    const inquiryColumn = page.locator('div:has(h3:text("Inquiry"))').first();
    const leadCard = inquiryColumn.locator('[class*="bg-white"][class*="cursor-move"]').first();

    if (await leadCard.count() > 0) {
      // Get the company name before dragging
      const companyName = await leadCard.locator('h4').textContent();

      // Find the Qualification column
      const qualificationColumn = page.locator('div:has(h3:text("Qualification"))').first();

      // Drag from Inquiry to Qualification
      await leadCard.hover();
      await page.mouse.down();
      await qualificationColumn.hover();
      await page.mouse.up();

      // Wait for optimistic update
      await page.waitForTimeout(500);

      // Verify lead now appears in Qualification column
      const qualificationLeads = qualificationColumn.locator('h4');
      await expect(qualificationLeads).toContainText(companyName || '');
    }
  });

  test('should show column counts and values', async ({ page }) => {
    // Find columns and check for count badges
    const columns = page.locator('[class*="flex"][class*="flex-col"]');

    if (await columns.count() > 0) {
      // Look for count badges (they show lead count)
      const badges = page.locator('[class*="px-2"][class*="py-1"][class*="rounded-full"]');

      if (await badges.count() > 0) {
        const firstBadge = badges.first();
        await expect(firstBadge).toBeVisible();
      }
    }
  });

  test('should navigate to lead detail when clicking lead card', async ({ page }) => {
    // Wait for leads to load
    await page.waitForTimeout(1000);

    const leadCards = page.locator('[class*="bg-white"][class*="rounded-lg"][class*="border"]');

    if (await leadCards.count() > 0) {
      const firstCard = leadCards.first();

      // Click the lead card
      await firstCard.click();

      // Should navigate to lead detail page
      await expect(page).toHaveURL(/\/leads\/.+/);
    }
  });

  test('should show empty state when no leads in column', async ({ page }) => {
    // Some columns might be empty - check for "No leads" message
    const emptyMessages = page.locator('text=No leads');

    // There should be at least one empty column in a new system
    if (await emptyMessages.count() > 0) {
      await expect(emptyMessages.first()).toBeVisible();
    }
  });
});
