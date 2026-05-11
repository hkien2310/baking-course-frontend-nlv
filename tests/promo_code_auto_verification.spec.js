import { test, expect } from '@playwright/test';
import axios from 'axios';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5001/api';

async function loginAdmin(page) {
  await page.goto(`${BASE_URL}/auth`);
  await page.fill('input[type="email"]', 'admin@baking.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.admin-layout, .btn-logout', { timeout: 15000 });
}

async function loginUser(page) {
  await page.goto(`${BASE_URL}/auth`);
  await page.fill('input[type="email"]', 'user@baking.com');
  await page.fill('input[type="password"]', 'User123!');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.ud-profile-card, .btn-logout', { timeout: 15000 });
}

test.describe('PROMO CODE AUTOMATED VERIFICATION', () => {

  test('TC-01 & TC-02: Admin Create Promo (Manual & Auto-gen)', async ({ page }) => {
    console.log('--- TC-01 & TC-02 Start ---');
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin#loyalty`);
    await page.click('button:has-text("Mã giảm giá")');
    
    // 1. Manual Create with Unique Code
    const manualCode = 'M_' + Math.floor(Math.random() * 1000000);
    console.log(`Creating manual promo: ${manualCode}`);
    await page.click('button:has-text("Tạo mã mới")');
    await page.fill('input[placeholder="VD: SALE50K"]', manualCode);
    await page.selectOption('select', 'PERCENTAGE');
    await page.fill('input[placeholder="VD: 10"]', '10');
    await page.click('button:has-text("Tạo Mới")');
    
    // Wait for modal to close (the "Hủy bỏ" button should be gone)
    await expect(page.locator('button:has-text("Hủy bỏ")')).toBeHidden({ timeout: 10000 });
    // Check list updated
    await expect(page.locator(`text=${manualCode}`)).toBeVisible();
    console.log('Manual promo created.');

    // 2. Auto-gen Create (Leave code empty)
    console.log('Creating auto-gen promo...');
    await page.click('button:has-text("Tạo mã mới")');
    await page.selectOption('select', 'FIXED');
    await page.fill('input[placeholder="VD: 50.000"]', '50000');
    await page.click('button:has-text("Tạo Mới")');
    
    await expect(page.locator('button:has-text("Hủy bỏ")')).toBeHidden({ timeout: 10000 });
    
    // Check if a new 8-char code appeared
    const newCode = page.locator('code').filter({ hasText: /^[A-Z0-9]{8}$/ });
    await expect(newCode.first()).toBeVisible();
    console.log('Auto-gen promo created.');
  });

  test('TC-08: Admin Date Validation (Start > End)', async ({ page }) => {
    console.log('--- TC-08 Start ---');
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin#loyalty`);
    await page.click('button:has-text("Mã giảm giá")');
    await page.click('button:has-text("Tạo mã mới")');
    
    // Set End Date before Start Date
    await page.fill('input[name="startDate"]', '2026-12-01');
    await page.fill('input[name="endDate"]', '2026-11-01');
    
    const errorMsg = page.locator('text=Ngày hết hạn phải sau ngày bắt đầu');
    await expect(errorMsg).toBeVisible();
    console.log('Date validation verified.');
  });

  test('TC-06 & TC-10: Client Application & Min Order Value', async ({ page }) => {
    console.log('--- TC-06 & TC-10 Start ---');
    const adminTokenRes = await axios.post(`${API_URL}/auth/login`, { email: 'admin@baking.com', password: 'Admin123!' });
    const adminToken = adminTokenRes.data.token;
    
    const promoCode = 'MINVAL_' + Math.floor(Math.random() * 10000);
    await axios.post(`${API_URL}/promo-codes`, {
      code: promoCode,
      type: 'FIXED',
      value: 10000,
      minOrderValue: 1000000, 
      isActive: true
    }, { headers: { 'x-auth-token': adminToken } });

    await loginUser(page);
    await page.goto(`${BASE_URL}/program`);
    await page.locator('.program-card-v3').first().click();
    await page.locator('.btn-enroll, .lock-cta').first().click({ force: true });
    
    const promoOption = page.locator('.loyalty-option-card', { hasText: 'Mã giảm giá' });
    await promoOption.click();
    
    await page.fill('input[placeholder="Nhập mã..."]', promoCode);
    await page.click('button:has-text("Áp dụng")');
    
    await expect(page.locator('text=/Đơn hàng tối thiểu/i')).toBeVisible();
    console.log('Min order value constraint verified.');
  });

  test('TC-17: UI Currency Formatting Check', async ({ page }) => {
    console.log('--- TC-17 Start ---');
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin#loyalty`);
    await page.click('button:has-text("Mã giảm giá")');
    await page.click('button:has-text("Tạo mã mới")');
    
    const input = page.locator('input[placeholder="0 = không giới hạn"]'); 
    await input.fill('1000000');
    
    const val = await input.inputValue();
    expect(val).toBe('1.000.000');
    console.log('Currency formatting verified.');
  });

  test('TC-13: Security - API Block Negative/Over-limit Values', async ({ }) => {
    console.log('--- TC-13 Start (API Check) ---');
    const adminTokenRes = await axios.post(`${API_URL}/auth/login`, { email: 'admin@baking.com', password: 'Admin123!' });
    const adminToken = adminTokenRes.data.token;

    // Test negative value
    try {
      await axios.post(`${API_URL}/promo-codes`, {
        code: 'NEG_TEST',
        type: 'FIXED',
        value: -100,
        isActive: true
      }, { headers: { 'x-auth-token': adminToken } });
      throw new Error('API should have blocked negative value');
    } catch (err) {
      expect(err.response.status).toBe(400);
      expect(err.response.data.error).toContain('phải lớn hơn 0');
      console.log('Negative value blocked.');
    }

    // Test over 100%
    try {
      await axios.post(`${API_URL}/promo-codes`, {
        code: 'OVER_TEST',
        type: 'PERCENTAGE',
        value: 150,
        isActive: true
      }, { headers: { 'x-auth-token': adminToken } });
      throw new Error('API should have blocked percentage > 100');
    } catch (err) {
      expect(err.response.status).toBe(400);
      expect(err.response.data.error).toContain('1 đến 100');
      console.log('Over-limit percentage blocked.');
    }
  });
});
