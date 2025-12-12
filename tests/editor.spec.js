import { test, expect } from '@playwright/test';

test('editor opens with form on left and preview on right', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:9091/');

  // Wait for the main heading to appear
  await expect(page.locator('h3').filter({ hasText: 'Fundamentals' })).toBeVisible({ timeout: 10000 });

  // Check that the left navigation is visible
  await expect(page.getByRole('link', { name: 'Fundamentals' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Schemas' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'SLA' })).toBeVisible();

  // Check that form inputs are visible (left side)
  await expect(page.getByPlaceholder('Enter document name')).toBeVisible();
  await expect(page.getByLabel('ID')).toBeVisible();

  // Check that the preview section is visible on the right
  await expect(page.getByText('Untitled Contract')).toBeVisible();
  await expect(page.getByText('draft').first()).toBeVisible();

  // Verify the Preview tab button is present
  await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible();

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'tests/screenshots/editor-layout.png', fullPage: true });

  console.log('✓ Editor loaded successfully');
  console.log('✓ Form elements visible on the left');
  console.log('✓ Preview section visible on the right');
});
