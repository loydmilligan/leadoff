/**
 * E2E Test: Closed Stages (CLOSED_WON and CLOSED_LOST)
 * Tests the complete deal closure flow including metadata capture
 */

import { test, expect } from '@playwright/test';

test.describe('Closed Stages', () => {
  test.beforeEach(async ({ page }) => {
    // Start from dashboard
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('h1:has-text("Lead Dashboard")');
  });

  test('should prompt for lost reason when moving to CLOSED_LOST via dropdown', async ({ page }) => {
    // Wait for leads to load
    await page.waitForTimeout(1000);

    // Find the first lead and its stage dropdown
    const stageDropdown = page.locator('select[class*="border-gray-300"]').first();

    if (await stageDropdown.count() > 0) {
      // Select CLOSED_LOST
      await stageDropdown.selectOption('CLOSED_LOST');

      // Should show lost reason modal
      await expect(page.getByText('Close as Lost')).toBeVisible();

      // Should require selecting a reason
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      await expect(confirmButton).toBeDisabled();

      // Select a lost reason
      await page.getByLabel('Lost Reason').selectOption('PRICE');

      // Now confirm button should be enabled
      await expect(confirmButton).toBeEnabled();

      // Click confirm
      await confirmButton.click();

      // Modal should close
      await expect(page.getByText('Close as Lost')).not.toBeVisible();
    }
  });

  test('should require competitor name when lost reason is COMPETITOR', async ({ page }) => {
    // Navigate to pipeline
    await page.goto('http://localhost:5173/pipeline');
    await page.waitForSelector('h1:has-text("Sales Pipeline")');
    await page.waitForTimeout(1000);

    // Find a lead in Negotiation column (easier to close from here)
    const negotiationColumn = page.locator('div:has(h3:text("Negotiation"))').first();
    const leadCard = negotiationColumn.locator('[class*="bg-white"][class*="cursor-move"]').first();

    if (await leadCard.count() > 0) {
      // Use stage select dropdown on the dashboard instead
      await page.goto('http://localhost:5173/');
      await page.waitForTimeout(1000);

      const stageDropdown = page.locator('select[class*="border-gray-300"]').first();

      if (await stageDropdown.count() > 0) {
        // Select CLOSED_LOST
        await stageDropdown.selectOption('CLOSED_LOST');

        // Wait for modal
        await page.waitForSelector('text=Close as Lost');

        // Select COMPETITOR reason
        await page.getByLabel('Lost Reason').selectOption('COMPETITOR');

        // Competitor name field should appear and be required
        await expect(page.getByLabel('Competitor Name')).toBeVisible();

        // Confirm button should still be disabled without competitor name
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        await expect(confirmButton).toBeDisabled();

        // Enter competitor name
        await page.getByLabel('Competitor Name').fill('Competitor X');

        // Now confirm should be enabled
        await expect(confirmButton).toBeEnabled();

        // Cancel instead of confirming
        await page.getByRole('button', { name: /cancel/i }).click();
      }
    }
  });

  test('should allow optional notes for lost reason', async ({ page }) => {
    await page.waitForTimeout(1000);

    const stageDropdown = page.locator('select[class*="border-gray-300"]').first();

    if (await stageDropdown.count() > 0) {
      // Select CLOSED_LOST
      await stageDropdown.selectOption('CLOSED_LOST');

      // Wait for modal
      await page.waitForSelector('text=Close as Lost');

      // Select TIMING reason
      await page.getByLabel('Lost Reason').selectOption('TIMING');

      // Add notes
      const notesField = page.getByLabel('Notes (optional)');
      await expect(notesField).toBeVisible();
      await notesField.fill('Customer wants to revisit in Q2 2025');

      // Confirm
      await page.getByRole('button', { name: /confirm/i }).click();

      // Modal should close
      await expect(page.getByText('Close as Lost')).not.toBeVisible();
    }
  });

  test('should successfully close deal as WON without prompts', async ({ page }) => {
    await page.waitForTimeout(1000);

    const stageDropdown = page.locator('select[class*="border-gray-300"]').first();

    if (await stageDropdown.count() > 0) {
      // Get initial stage
      const initialStage = await stageDropdown.inputValue();

      // Select CLOSED_WON
      await stageDropdown.selectOption('CLOSED_WON');

      // Should NOT show any modal (no prompt needed for won deals)
      await page.waitForTimeout(500);
      await expect(page.getByText('Close as Won')).not.toBeVisible();

      // Verify stage updated
      const updatedStage = await stageDropdown.inputValue();
      expect(updatedStage).toBe('CLOSED_WON');
    }
  });

  test('should prompt for demo date when moving to DEMO_SCHEDULED', async ({ page }) => {
    await page.waitForTimeout(1000);

    const stageDropdown = page.locator('select[class*="border-gray-300"]').first();

    if (await stageDropdown.count() > 0) {
      // Select DEMO_SCHEDULED
      await stageDropdown.selectOption('DEMO_SCHEDULED');

      // Should show demo scheduling modal
      await expect(page.getByText('Schedule Demo')).toBeVisible();

      // Should have demo date field
      await expect(page.getByLabel('Demo Date & Time')).toBeVisible();

      // Confirm should be disabled without date
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      await expect(confirmButton).toBeDisabled();

      // Set a future date/time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

      await page.getByLabel('Demo Date & Time').fill(dateString);

      // Now confirm should be enabled
      await expect(confirmButton).toBeEnabled();

      // Confirm
      await confirmButton.click();

      // Modal should close
      await expect(page.getByText('Schedule Demo')).not.toBeVisible();
    }
  });

  test('should allow canceling stage-specific prompts', async ({ page }) => {
    await page.waitForTimeout(1000);

    const stageDropdown = page.locator('select[class*="border-gray-300"]').first();

    if (await stageDropdown.count() > 0) {
      const initialStage = await stageDropdown.inputValue();

      // Select CLOSED_LOST
      await stageDropdown.selectOption('CLOSED_LOST');

      // Wait for modal
      await page.waitForSelector('text=Close as Lost');

      // Click cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Modal should close
      await expect(page.getByText('Close as Lost')).not.toBeVisible();

      // Stage should revert to original
      await page.waitForTimeout(500);
      const currentStage = await stageDropdown.inputValue();
      expect(currentStage).toBe(initialStage);
    }
  });
});
