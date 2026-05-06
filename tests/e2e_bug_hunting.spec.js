import { test, expect } from '@playwright/test';

/**
 * BỘ TEST TỰ VẬN HÀNH (SELF-OPERATING) CHO DỰ ÁN BAKING
 * Mục tiêu: Thay thế các Ruflo Agent để bắt bug trực tiếp.
 */

const BASE_URL = 'http://localhost:5173';

test.describe('Agent: The Explorer (UI & Filtering)', () => {
  test('Kiểm tra khối Sản phẩm học viên trên Homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Đợi section Sản phẩm học viên load
    const section = page.locator('#san-pham-hoc-vien');
    await expect(section).toBeVisible();

    // Chụp ảnh để AI kiểm tra "Full Scale"
    await section.screenshot({ path: 'test-results/student-work-ui.png' });
    console.log('--- Đã chụp ảnh Sản phẩm học viên: test-results/student-work-ui.png');

    // Kiểm tra chiều cao các owl-item (phải bằng nhau)
    const items = await page.locator('#san-pham-hoc-vien .owl-item').all();
    if (items.length > 0) {
      const heights = await Promise.all(items.map(async (item) => {
        const box = await item.boundingBox();
        return box?.height || 0;
      }));
      const firstHeight = heights[0];
      const allEqual = heights.every(h => Math.abs(h - firstHeight) < 5); // Sai số 5px
      console.log(`--- Chiều cao các slide: ${heights.join(', ')}`);
      expect(allEqual).toBe(true);
    }
  });

  test('Kiểm tra bộ lọc giá "Không giới hạn"', async ({ page }) => {
    await page.goto(`${BASE_URL}/program`);
    
    // Kéo thanh trượt giá lên tối đa
    const slider = page.locator('input[type="range"]');
    await slider.fill('10000000');
    
    // Kiểm tra text UI
    const priceLabel = page.locator('.font-weight-bold.color-main');
    await expect(priceLabel).toHaveText('(Không giới hạn)');

    // Nhấn Apply và kiểm tra URL
    await page.click('button:has-text("Áp dụng bộ lọc")');
    const url = page.url();
    expect(url).not.toContain('maxPrice=10000000');
    expect(url).not.toContain('minPrice=0');
    console.log(`--- URL sau khi lọc: ${url}`);
  });
});

test.describe('Agent: The Buyer (Checkout Validation)', () => {
  test('Cố tình bỏ trống thông tin hóa đơn khi Xuất hóa đơn', async ({ page }) => {
    // Truy cập một khóa học bất kỳ (cần đảm bảo có data)
    await page.goto(`${BASE_URL}/program`);
    await page.locator('.program-card').first().click();
    
    // Nhấn nút Mua (có thể là "Mua khóa học" hoặc "Đăng ký")
    const buyBtn = page.locator('.btn-enroll, button:has-text("MUA KHÓA HỌC")').first();
    await buyBtn.click();

    // Đợi sang trang Checkout
    await expect(page).toHaveURL(/.*checkout/);

    // Chọn "Xuất hóa đơn"
    await page.check('#yesInvoice');
    
    // Nhấn "Trả tiền qua VNPay" mà không điền gì
    const payBtn = page.locator('button[type="submit"]');
    await payBtn.click();

    // KIỂM TRA: Trình duyệt phải báo lỗi validation (Native HTML5)
    // Playwright có thể kiểm tra thuộc tính valid của input
    const taxCodeInput = page.locator('input[placeholder*="0123456789"]');
    const isValid = await taxCodeInput.evaluate((node) => node.validity.valid);
    expect(isValid).toBe(false);
    
    // Đảm bảo không chuyển trang (vẫn ở checkout)
    await expect(page).toHaveURL(/.*checkout/);
    console.log('--- XÁC NHẬN: Browser đã chặn gọi API thành công do thiếu thông tin hóa đơn.');
  });
});
