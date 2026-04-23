# Changelog — YUM Saigon Baking Platform

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi nhận tại đây.

---

## [Unreleased] — 2026-04-23

### 🎨 Giao diện & Layout

- **Redesign Course Card** — Chỉnh lại thẻ khóa học theo mẫu mới (tham khảo caogiang.vn):
  - Thêm badge giảm giá (%) góc trên phải ảnh
  - Hiển thị rõ Giá gốc (gạch ngang) + Giá khuyến mãi
  - Bổ sung nút **Mua ngay** trên card
  - Giữ nguyên hiển thị số học viên (chỉnh sửa thủ công từ Admin)
- **Sắp xếp lại trang chủ** — Thứ tự mới từ trên xuống:
  1. Slider
  2. Khóa học nổi bật _(đổi tên từ "Khắp mọi nơi các lớp nấu ăn")_
  3. Khóa học mới _(section mới)_
  4. Cảm nhận học viên
  5. Giới thiệu về YUM Saigon
- **Xóa bỏ thông tin Người dạy** — Ẩn toàn bộ thông tin giảng viên trên trang web:
  - Xóa author overlay trên course card
  - Xóa widget giảng viên trên trang chi tiết khóa học
  - Ẩn menu "Giảng viên" trên thanh navigation

### 🗄️ Database

- Thêm trường `salePrice` (Int, nullable) vào model `Program` để hỗ trợ giá khuyến mãi

### 🛠️ Admin CMS

- Bổ sung input "Giá khuyến mãi" trong form tạo/sửa khóa học

### 🔧 Utilities

- Thêm helper `formatStudentCount()` — format số học viên dạng rút gọn (VD: 1600 → "1,6k")
- Thêm helper `calcDiscountPercent()` — tính phần trăm giảm giá

---

## [1.0.0] — 2026-04-17

### 🚀 Ra mắt phiên bản đầu tiên

- Full-stack platform: React 18 (Vite) + Node.js/Express + PostgreSQL (Prisma)
- Trang công khai: Trang chủ, Giới thiệu, Khóa học, Blog/Công thức, Liên hệ
- Hệ thống thanh toán: VNPay + Chuyển khoản ngân hàng
- Premium Content: Video bài giảng, tài liệu PDF, hướng dẫn chi tiết
- Admin CMS: Quản lý khóa học, bài viết, giảng viên, slider, đơn hàng
- Tài khoản học viên: Đăng ký, đăng nhập, xem khóa đã mua
- Hỗ trợ đa ngôn ngữ (i18n): Tiếng Việt + Tiếng Anh
- Tài liệu quản trị chi tiết (HUONG_DAN_QUAN_TRI.md)
