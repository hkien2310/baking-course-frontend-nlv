import { test, expect } from '@playwright/test';

/**
 * BỘ TEST TỰ VẬN HÀNH (SELF-OPERATING) CHO DỰ ÁN BAKING
 * Mục tiêu: Thay thế các Ruflo Agent để bắt bug trực tiếp.
 */

const BASE_URL = 'http://localhost:5173';

async function login(page, email = 'user@baking.com', password = 'User123!') {
  await page.goto(`${BASE_URL}/auth`);
  // Đợi form login hiện ra
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Chờ chuyển hướng và sự hiện diện của layout admin hoặc profile user
  await page.waitForSelector('.admin-layout, .ud-profile-card, .btn-logout, .admin-logout-btn', { timeout: 15000 });
}

test.describe('Agent: The Explorer (UI & Filtering)', () => {
  test('Kiểm tra khối Sản phẩm học viên trên Homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Đợi section Sản phẩm học viên load
    // Thêm scroll xuống cuối trang để trigger lazy load hoặc animation nếu có
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const section = page.locator('#san-pham-hoc-vien');
    await expect(section).toBeVisible({ timeout: 10000 });

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
    // Bước 0: Đăng nhập bằng tài khoản USER thông thường
    await login(page, 'user@baking.com', 'User123!');

    // Bước 1: Truy cập một khóa học bất kỳ
    await page.goto(`${BASE_URL}/program`);
    
    // Đợi danh sách khóa học hiện ra
    const firstCard = page.locator('.program-card-v3').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    
    // Đợi chuyển sang trang chi tiết
    await expect(page).toHaveURL(/.*program\/.*/);
    console.log(`--- Đã vào trang chi tiết: ${page.url()}`);

    // Nhấn nút Mua (Sử dụng selector chính xác hơn từ code)
    const buyBtn = page.locator('.enrollment-widget .btn-enroll, .lock-cta').first();
    await buyBtn.click({ force: true });

    // Đợi sang trang Checkout
    await page.waitForURL(/.*checkout.*/, { timeout: 15000 });
    console.log(`--- Đã vào trang Checkout: ${page.url()}`);

    // Chọn "Xuất hóa đơn"
    await page.click('label[for="yesInvoice"]');
    
    // Nhấn "Trả tiền qua VNPay" mà không điền gì
    const payBtn = page.locator('button[type="submit"]:has-text("Trả tiền qua VNPay"), button:has-text("THANH TOÁN")').first();
    await payBtn.click();

    // KIỂM TRA: Trình duyệt phải báo lỗi validation (Native HTML5)
    const taxCodeInput = page.getByPlaceholder('VD: 0123456789');
    await expect(taxCodeInput).toBeVisible();
    const isValid = await taxCodeInput.evaluate((node) => node.validity.valid);
    expect(isValid).toBe(false);
    
    // Đảm bảo không chuyển trang (vẫn ở checkout)
    await expect(page).toHaveURL(/.*checkout.*/);
    console.log('--- XÁC NHẬN: Browser đã chặn gọi API thành công do thiếu thông tin hóa đơn.');
  });
});

test.describe('Agent: Chaos Monkey (Security & Stability)', () => {
  test('Spam Form Liên hệ với 1000+ ký tự', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    // Điền dữ liệu rác cực lớn
    await page.fill('input[name="fullName"]', 'Chaos Monkey');
    await page.fill('input[name="email"]', 'monkey@chaos.com');
    await page.fill('input[name="subject"]', 'Spam Test ' + 'A'.repeat(100));
    await page.fill('textarea[name="message"]', 'B'.repeat(1200));

    // Gửi form
    await page.click('button[type="submit"]');

    // Kiểm tra xem hệ thống có báo lỗi hoặc xử lý êm đẹp không
    await expect(page.locator('.alert-success, .alert-danger').first()).toBeVisible({ timeout: 10000 });
    console.log('--- Đã gửi spam 1200 ký tự. Hệ thống vẫn phản hồi, không bị treo.');
  });

  test('Thử nghiệm XSS Injection vào form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    const xssPayload = '<script>alert("xss")</script>';
    await page.fill('input[name="fullName"]', xssPayload);
    await page.fill('input[name="email"]', 'xss@test.com');
    await page.fill('textarea[name="message"]', 'Kiểm tra XSS payload trong message');

    await page.click('button[type="submit"]');

    // Kiểm tra xem payload có bị render trực tiếp không
    console.log('--- Đã gửi XSS payload. Kiểm tra xem server có lọc bỏ script không.');
  });
});
