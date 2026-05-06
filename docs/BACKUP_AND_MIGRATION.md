# Kế hoạch Di trú Hệ thống (Zero Data Loss Migration)

Tài liệu này dành cho chủ sở hữu dự án (người không chuyên về kỹ thuật) để đảm bảo khi chuyển hệ thống sang server mới hoặc bàn giao cho kỹ thuật viên khác, **100% dữ liệu (bài viết, đơn hàng, hình ảnh)** được bảo toàn.

---

## 1. Hiểu về "Tài sản" của bạn (4 Trụ cột)

Hệ thống của bạn đang chạy phân tán để đạt hiệu suất cao nhất. Bạn cần kiểm soát 4 phần sau:

1.  **Dữ liệu chữ (Database):** Nằm trên **Neon**. Chứa đơn hàng, bài viết, thông tin học viên.
2.  **Hình ảnh (Assets):** Nằm trên **Cloudinary**. Chứa ảnh khóa học, ảnh blog, ảnh minh chứng chuyển khoản.
3.  **Bộ não xử lý (Backend):** Nằm trên **Render**.
4.  **Giao diện (Frontend):** Nằm trên **Vercel** (Được deploy từ Repo Fork).

### Quản lý Mã nguồn (Source Code)
Hiện tại hệ thống sử dụng cấu trúc 2 kho lưu trữ (Repo) để phục vụ việc deploy:
- **Repo Gốc (Real):** `ocanhdt12-gif/baking-course-frontend` (Nơi lưu trữ chính nhưng không có quyền deploy Vercel).
- **Repo Fork:** `hkien2310/baking-course-frontend` (Dùng để kết nối và deploy lên Vercel cá nhân).

**Nguyên tắc đồng bộ:** Khi có code mới, phải push lên cả 2 repo này để đảm bảo Backend (Render) và Frontend (Vercel) đều nhận được bản cập nhật.

---

## 2. Kế hoạch di trú 5 bước (Không mất dữ liệu)

### Bước 1: "Đóng băng" dữ liệu (Data Freeze)
Trước khi chuyển, hãy thông báo tạm dừng cập nhật website (không đăng bài mới, không tạo đơn hàng mới) trong khoảng 30 phút để đảm bảo dữ liệu lúc copy là dữ liệu mới nhất.

### Bước 2: Sao lưu Database từ Neon (Trụ cột 1)
Đây là phần quan trọng nhất.
- **Cách làm:** Vào Dashboard của Neon -> Chọn Database của bạn -> Tìm mục **Export** hoặc dùng lệnh sau trên máy tính:
```bash
pg_dump "ĐƯỜNG_DẪN_DATABASE_URL_LẤY_TỪ_NEON" > du_lieu_vua_moi_nhat.sql
```
*File `.sql` này chính là "linh hồn" của website.*

### Bước 3: Thu thập "Chìa khóa vàng" (Environment Variables)
Bạn cần vào Dashboard của **Render** và **Vercel**, copy toàn bộ danh sách trong mục **Environment Variables** ra một file Word hoặc Excel.
- Các Key bắt đầu bằng `CLOUDINARY_...`
- Các Key bắt đầu bằng `VNPAY_...`
- `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`...

### Bước 4: Thiết lập nhà mới
1.  **Tại Database mới:** Tạo một database rỗng và chạy lệnh nạp dữ liệu:
    `psql "URL_DATABASE_MOI" < du_lieu_vua_moi_nhat.sql`
2.  **Tại Backend mới:** Đẩy code lên và dán lại các "Chìa khóa vàng" đã copy ở Bước 3.
3.  **Tại Frontend mới:** Đẩy code lên và cập nhật link API mới.

### Bước 5: Kiểm tra và Thông tuyến
- Kiểm tra xem ảnh có hiện không (Nếu hiện là Cloudinary đã thông).
- Kiểm tra xem bài viết cũ có còn không (Nếu còn là Database đã thông).
- Thử tạo 1 đơn hàng mới xem có nhảy vào Database không.

---

## 3. Tại sao ảnh của bạn không bao giờ mất?

Nhờ công nghệ Cloudinary chúng ta vừa triển khai:
- Ảnh **không nằm trên server**.
- Dù server Render có bị xóa sạch code, ảnh vẫn nằm an toàn trên "đám mây" Cloudinary.
- Khi sang server mới, bạn chỉ cần điền đúng 3 cái Key (Cloud Name, API Key, API Secret) là ảnh tự động hiển thị lại.

---

## 4. Checklist bàn giao cho kỹ thuật viên

Nếu anh thuê một bạn kỹ thuật khác làm, hãy gửi cho họ đúng 3 dòng này:
1. "Mã nguồn nằm trên GitHub này: [Link]"
2. "File dữ liệu mới nhất tôi đã xuất ra đây: [File .sql]"
3. "Danh sách các biến môi trường (Keys) tôi để ở đây: [File Word/Excel]"

---

## 5. Lời khuyên cho chủ dự án
- **Định kỳ hàng tháng:** Anh nên nhờ kỹ thuật hoặc tự mình chạy lệnh `pg_dump` để lấy file `.sql` về máy cá nhân làm kỷ niệm và dự phòng.
- **Bảo mật:** Không bao giờ gửi file `.env` hoặc danh sách Keys lên các nhóm chat công khai.
