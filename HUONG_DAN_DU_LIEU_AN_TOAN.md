# Hướng dẫn Bảo trì Dữ liệu & Cập nhật Server (An toàn 100%)

Tài liệu này hướng dẫn cách vận hành hệ thống giữa **Render (Code)** và **Neon (Dữ liệu)** để đảm bảo bạn có thể cập nhật website mà không bao giờ làm mất dữ liệu học viên, đơn hàng hay khóa học.

---

## 1. Cấu hình trên Render (Quan trọng)

Để server Render tự động cập nhật Database mà không xóa dữ liệu cũ, hãy luôn đảm bảo dòng **Build Command** trong mục **Settings** trên Render được đặt đúng như sau:

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

> **Lưu ý:** Tuyệt đối không dùng lệnh `prisma db push` hoặc `prisma migrate reset` trên Render vì có nguy cơ làm mất dữ liệu thật.

---

## 2. Quy trình cập nhật Database (Khi muốn thêm tính năng mới)

Khi bạn (hoặc lập trình viên) muốn thay đổi cấu trúc dữ liệu (ví dụ: thêm một cột mới vào bảng Khóa học), hãy thực hiện đúng 3 bước:

### Bước 1: Tạo file ghi nhận thay đổi (Tại máy cá nhân)
Mở cửa sổ lệnh (Terminal) tại thư mục `backend` và gõ:
```bash
npx prisma migrate dev --name mo_ta_thay_doi
```
Lệnh này sẽ tạo ra một thư mục mới trong `backend/prisma/migrations`. Thư mục này chứa "lệnh nâng cấp" cho Database.

### Bước 2: Đẩy code lên Github
Dùng Git để push toàn bộ code, bao gồm cả thư mục `migrations` vừa tạo ở Bước 1 lên Github.

### Bước 3: Render tự động thực thi
Khi bạn push code, Render sẽ nhận diện có "lệnh nâng cấp" mới. Lệnh `prisma migrate deploy` (đã cài ở mục 1) sẽ tự động chạy các lệnh này để cập nhật Database Neon của bạn một cách an toàn.

---

## 3. Quản lý Hình ảnh
Hệ thống sử dụng **Cloudinary** để lưu trữ toàn bộ ảnh. 
- Ảnh sẽ **KHÔNG** bị mất khi bạn xóa code trên Render hay cài lại máy.
- Đừng bao giờ lưu ảnh vào thư mục `backend/uploads` vì Render sẽ xóa sạch thư mục này mỗi khi bạn cập nhật code mới.

---

## 4. Những điều TUYỆT ĐỐI KHÔNG làm
1. **Không chạy Seed trên server:** Trừ khi bạn muốn nạp dữ liệu mẫu vào một Database hoàn toàn trống. Chạy seed có thể gây trùng lặp hoặc ghi đè dữ liệu thật.
2. **Không chia sẻ file `.env`**: File này chứa mật khẩu Database. Nếu lộ, dữ liệu có thể bị đánh cắp.
3. **Không dùng `db push` cho dữ liệu thật**: Luôn ưu tiên dùng `migrate deploy` như hướng dẫn ở trên.

---

**Kết luận:** Chỉ cần giữ đúng dòng lệnh Build trên Render và đẩy đủ các file trong thư mục `migrations` lên Github, dữ liệu của bạn sẽ luôn được bảo vệ an toàn 100%.
