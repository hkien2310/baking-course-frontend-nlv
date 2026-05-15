import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Receipt Page (Blog/Recipes)', () => {
  test('should load the receipt page and display posts', async ({ page }) => {
    await page.goto(`${BASE_URL}/receipt`);
    
    // Check H1 title instead of document title
    const h1 = page.locator('h1');
    await expect(h1).toContainText(/Cẩm Nang/);
    
    // Check if featured posts section is visible
    const featuredTitle = page.locator('.featured-title');
    await expect(featuredTitle).toBeVisible();
    
    // Check if at least one post is rendered in the main list
    const blogCards = page.locator('article.post');
    await expect(blogCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter posts by category', async ({ page }) => {
    await page.goto(`${BASE_URL}/receipt`);
    
    // Wait for categories to load in sidebar
    const categoryLinks = page.locator('.widget_categories li.cat-item a:not([href="/receipt"])');
    
    // If there are categories, click the first one
    const count = await categoryLinks.count();
    if (count > 0) {
      const firstCategory = categoryLinks.first();
      const categoryName = await firstCategory.innerText();
      
      await firstCategory.click();
      
      // Check if URL has the category filter (case-insensitive)
      const url = page.url();
      expect(decodeURIComponent(url.toLowerCase())).toContain(`cat=${categoryName.toLowerCase()}`);
      
      // Wait for posts to reload
      await page.waitForTimeout(1000); // Simple wait for network
      
      // Check if posts are displayed
      const blogCards = page.locator('article.post');
      await expect(blogCards.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should navigate through pagination', async ({ page }) => {
    await page.goto(`${BASE_URL}/receipt`);
    
    // Check if pagination exists
    const nextButton = page.locator('.pagination .next');
    
    if (await nextButton.isVisible()) {
      // Check if it's not disabled
      const isDisabled = await nextButton.evaluate(node => node.classList.contains('disabled'));
      
      if (!isDisabled) {
        await nextButton.click();
        
        // Wait for posts to reload
        await page.waitForTimeout(1000);
        
        // Check if current page is 2 (contains "2")
        const currentPage = page.locator('.pagination .current');
        await expect(currentPage).toContainText('2');
      }
    }
  });
});
