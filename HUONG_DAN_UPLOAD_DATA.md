# 📤 Hướng Dẫn Upload Data — Muka Baking Admin

> **Phiên bản:** 1.0 · **Cập nhật:** 23/04/2026
> **Đối tượng:** Quản trị viên (Admin) cần đẩy dữ liệu lên website
> **Địa chỉ Admin:** `http://103.143.142.245/baking/auth`

---

## Mục lục

1. [Tổng quan quy trình](#1-tổng-quan-quy-trình)
2. [Đăng nhập Admin](#2-đăng-nhập-admin)
3. [Upload ảnh — Quy tắc chung](#3-upload-ảnh--quy-tắc-chung)
4. [Bước 1: Tạo Khóa học](#4-bước-1-tạo-khóa-học)
5. [Bước 2: Tạo Bài viết & Cẩm nang](#5-bước-2-tạo-bài-viết--cẩm-nang)
6. [Bước 3: Tạo Đánh giá (Testimonials)](#6-bước-3-tạo-đánh-giá-testimonials)
7. [Bước 4: Ghim Khóa học lên Slider trang chủ](#7-bước-4-ghim-khóa-học-lên-slider-trang-chủ)
8. [Checklist hoàn tất](#8-checklist-hoàn-tất)
9. [Xử lý lỗi thường gặp khi upload](#9-xử-lý-lỗi-thường-gặp-khi-upload)

---

## 1. Tổng quan quy trình

Khi website mới hoặc cần đẩy data mới, hãy thực hiện **theo thứ tự** sau:

```
Bước 1 → Tạo Khóa học (bao gồm ảnh, mô tả, giáo trình, nội dung Premium)
Bước 2 → Tạo Bài viết / Cẩm nang
Bước 3 → Tạo Đánh giá (Testimonials)
Bước 4 → Ghim Khóa học nổi bật lên Slider trang chủ
```

> ⚠️ **Quan trọng:** Chuẩn bị sẵn tất cả ảnh + nội dung TRƯỚC khi vào Admin. Xem mục 3 để biết quy cách ảnh.

---

## 2. Đăng nhập Admin

1. Truy cập: `http://103.143.142.245/baking/auth`
2. Nhập **Email** + **Mật khẩu** Admin
3. Nhấn **Đăng nhập** → Hệ thống chuyển đến trang Quản trị

---

## 3. Upload ảnh — Quy tắc chung

Mọi form trong Admin đều sử dụng **cùng 1 component upload ảnh**. Hiểu rõ cách hoạt động sẽ giúp bạn thao tác nhanh hơn.

### 3.1 Hai cách đưa ảnh lên

| Cách | Thao tác | Khi nào dùng |
|------|----------|-------------|
| **Kéo thả / Click chọn file** | Nhấn vào vùng upload → Chọn file từ máy tính (hoặc kéo thả file vào) | ✅ Khuyến nghị — ảnh lưu trên server |
| **Dán link ngoài** | Dán URL ảnh vào ô text phía dưới vùng upload | Khi ảnh đã có sẵn trên internet |

### 3.2 Quy cách file ảnh

| Tiêu chí | Yêu cầu |
|----------|---------|
| **Định dạng** | JPG, PNG, GIF, WebP |
| **Dung lượng tối đa** | 5 MB / file |
| **Kích thước khuyến nghị** | Xem bảng bên dưới |

### 3.3 Bảng kích thước ảnh khuyến nghị

| Loại ảnh | Kích thước | Tỉ lệ |
|----------|-----------|--------|
| Ảnh khóa học (thumbnail) | 800 × 600 px | 4:3 |
| Ảnh bài viết | 1200 × 675 px | 16:9 |
| Ảnh QR thanh toán | Tùy ý | — |

### 3.4 Mẹo chuẩn bị ảnh trước khi upload

1. **Đặt tên file rõ ràng:** `khoa-banh-phap.jpg`, `blog-sourdough.png`
2. **Nén ảnh trước:** Dùng [tinypng.com](https://tinypng.com) để giảm dung lượng mà không giảm chất lượng
3. **Kiểm tra tỉ lệ:** Ảnh khóa học nên là 4:3, ảnh blog nên là 16:9
4. **Tổ chức theo folder:** Tạo các folder `khoa-hoc/`, `bai-viet/`, `testimonials/` trên máy tính để dễ tìm

---

## 4. Bước 1: Tạo Khóa học

**Vị trí:** Sidebar → **Khóa học** → Nhấn **+ Tạo mới**

Giao diện soạn thảo khóa học chia thành **4 tab**. Điền lần lượt từ tab 1 → tab 4.

---

### TAB 1: Thông tin chung & Chi phí

| Trường | Cách điền | Bắt buộc |
|--------|-----------|----------|
| **Tên Khóa Học** | Tối thiểu 5 ký tự. VD: `Làm Bánh Ngọt Pháp Cơ Bản` | ✅ |
| **Danh mục** | Chọn có sẵn hoặc gõ mới. VD: `Bánh Ngọt`, `Món Âu` | — |
| **Giá gốc (đ)** | Số nguyên VNĐ. VD: `500000` = 500.000đ. Nhập `0` = Miễn phí | ✅ |
| **Giá khuyến mãi (đ)** | Để trống nếu không khuyến mãi | — |
| **Khóa học nổi bật** | Bật toggle → hiển thị trên trang chủ (dùng ở Bước 4) | — |
| **Số lượng học viên** | Số hiển thị ảo trên card. VD: `120` | — |
| **Số lượng đánh giá** | Số hiển thị ảo trên card. VD: `45` | — |

---

### TAB 2: Nội dung & Hình ảnh

#### Ảnh Đại Diện (Thumbnail)

→ Kéo thả hoặc nhấn chọn file. Kích thước khuyến nghị: `800 × 600 px`

#### Mô tả tổng quát

- Tối thiểu 20 ký tự
- Hỗ trợ HTML — có thể viết nội dung giàu định dạng
- **Ví dụ đơn giản (text thuần):**
  ```
  Khóa học toàn diện về kỹ thuật làm bánh Pháp, từ croissant đến macaron.
  Phù hợp cho người mới bắt đầu và người muốn nâng cao tay nghề.
  ```
- **Ví dụ nâng cao (HTML):**
  ```html
  <p><strong>Khóa học toàn diện</strong> về kỹ thuật làm bánh Pháp.</p>
  <ul>
    <li>Croissant và lamination</li>
    <li>Macaron hoàn hảo</li>
    <li>Choux pastry chuyên nghiệp</li>
  </ul>
  ```

#### Mục tiêu khóa học (Thanh Kỹ Năng)

Nhấn **+ Thêm Kỹ Năng Mới** → Điền **Tên** + **%**

| Ví dụ | % |
|-------|---|
| Kỹ thuật nhồi bột | 90 |
| Trang trí bánh kem | 85 |
| An toàn thực phẩm | 95 |

> 💡 Nên thêm 3–5 mục. Phần trăm mang tính minh họa.

#### Lợi ích khóa học

Nhấn **+ Thêm Lợi Ích Mới** → Nhập từng dòng:

```
Hơn 20 video bài giảng chất lượng cao
Tài liệu PDF chi tiết từng công thức
Chứng nhận hoàn thành
Hỗ trợ trực tuyến từ giảng viên
```

---

### TAB 3: Giáo trình (Curriculum)

Nhấn **+ Thêm Chương Mới** → Điền **Tiêu đề** (bắt buộc) + **Nội dung** (tối thiểu 10 ký tự)

**Ví dụ:**

| Chương | Tiêu đề | Nội dung |
|--------|---------|----------|
| 1 | Tìm Hiểu Nguyên Liệu | Phân loại bột mì, cách chọn bơ, trứng. So sánh nguyên liệu. |
| 2 | Kỹ Thuật Nhồi Bột | Các kỹ thuật gấp, cuộn, kéo. Cách nhận biết bột đạt chuẩn. |
| 3 | Nướng & Kiểm Soát Nhiệt | Cài đặt lò, phân vùng nhiệt, thời gian nướng cho từng loại. |
| 4 | Trang Trí & Hoàn Thiện | Phủ kem, tạo hoa văn, sử dụng màu thực phẩm. |

---

### TAB 4: Nội dung Premium ⭐

> **Quan trọng nhất** — Đây là nội dung **chỉ mở khóa sau khi học viên thanh toán**.

#### 4a. Video Bài Giảng

Nhấn **+ Thêm Video Bài Giảng** → Điền **Tiêu đề** + **Link video**

| Trường | Ví dụ |
|--------|-------|
| Tiêu đề | `Bài 1: Giới thiệu khóa học` |
| Link video | `https://www.youtube.com/watch?v=xxxxx` |

> ✅ **Hệ thống tự động chuyển đổi link.** Bạn có thể dán link YouTube bình thường (`youtube.com/watch?v=...`), link Vimeo, hoặc Google Drive. Hệ thống sẽ tự convert sang dạng nhúng.

#### 4b. Tài nguyên Tải xuống

Nhấn **+ Thêm Tài Liệu** → Điền **Tên** + **Link tải**

| Trường | Ví dụ |
|--------|-------|
| Tên tài liệu | `Công thức Bánh Croissant PDF` |
| Link tải | `https://drive.google.com/file/d/.../view` |

> 💡 Dùng Google Drive, Dropbox hoặc bất kỳ dịch vụ lưu trữ nào. **Đảm bảo link được chia sẻ công khai.**

#### 4c. Hướng dẫn chi tiết

Ô text dạng văn bản dài, **hỗ trợ HTML**.

```html
<h3>📋 Hướng dẫn cho học viên</h3>
<p>Chào mừng bạn đến với khóa học!</p>
<ol>
  <li>Xem video theo thứ tự từ Bài 1 → Bài cuối</li>
  <li>Tải tài liệu PDF và in ra để ghi chú</li>
  <li>Thực hành mỗi công thức ít nhất 2 lần</li>
</ol>
```

---

### Lưu khóa học

Nhấn **💾 Lưu Khóa Học** ở thanh trên cùng. Hệ thống tự tạo slug (đường dẫn) từ tiêu đề.

> ⚠️ Sau khi lưu, kiểm tra ngay trên trang web bằng cách vào Sidebar → Khóa học → Nhấn **✏️ Sửa** → xem lại dữ liệu.

---

## 5. Bước 2: Tạo Bài viết & Cẩm nang

**Vị trí:** Sidebar → **Bài viết & Cẩm nang** → Nhấn **+ Tạo mới**

Giao diện chia **2 cột**: bên trái nhập liệu, bên phải xem trước theo thời gian thực.

### Thông tin cần điền

| Trường | Cách điền | Bắt buộc |
|--------|-----------|----------|
| **Tiêu đề** | Tối thiểu 5 ký tự | ✅ |
| **Loại** | `Bài Viết Blog` hoặc `Công Thức` | — |
| **Chuyên mục** | Chọn có sẵn HOẶC gõ mới vào ô bên dưới | — |
| **Tên Tác Giả** | Mặc định `Admin` | — |
| **Ngày Hiển Thị** | Chuỗi tùy chỉnh. VD: `15 Thg 4, 2026` | — |
| **Ảnh Đại Diện** | Upload (1200 × 675 px khuyến nghị) | — |
| **Mô tả ngắn** | 1–2 câu hấp dẫn, hiển thị trên thẻ card | — |
| **Nội dung chi tiết** | Viết bằng **HTML**, tối thiểu 50 ký tự | ✅ |

### Viết nội dung HTML — Mẫu nhanh

```html
<h2>Bí quyết làm bánh Croissant</h2>

<p>Croissant nổi tiếng với lớp vỏ giòn rụm và ruột xốp mịn.</p>

<h3>Nguyên liệu</h3>
<ul>
  <li>500g bột mì số 13</li>
  <li>250g bơ Président (lạnh)</li>
  <li>10g muối, 60g đường</li>
</ul>

<h3>Các bước thực hiện</h3>
<ol>
  <li><strong>Trộn bột:</strong> Đổ bột, muối, đường, men vào thau.</li>
  <li><strong>Ủ bột:</strong> Bọc bột, ủ tủ lạnh 1 giờ.</li>
  <li><strong>Nướng:</strong> 200°C trong 15–18 phút.</li>
</ol>

<blockquote>💡 Bơ phải lạnh cứng nhưng không quá đông.</blockquote>
```

### Thẻ HTML phổ biến — Bảng tra cứu nhanh

| Mục đích | HTML |
|----------|------|
| Tiêu đề lớn | `<h2>Tiêu đề</h2>` |
| Tiêu đề vừa | `<h3>Tiêu đề</h3>` |
| Đoạn văn | `<p>Nội dung...</p>` |
| In đậm | `<strong>Chữ đậm</strong>` |
| In nghiêng | `<em>Chữ nghiêng</em>` |
| Danh sách | `<ul><li>Mục 1</li></ul>` |
| Danh sách có số | `<ol><li>Bước 1</li></ol>` |
| Trích dẫn | `<blockquote>Trích dẫn</blockquote>` |
| Hình ảnh | `<img src="LINK" alt="Mô tả" />` |
| Link | `<a href="URL">Text</a>` |

> 💡 Cột **Xem trước** bên phải cập nhật ngay khi bạn gõ. Kiểm tra bố cục trước khi lưu.

Nhấn **💾 Lưu Bài Viết** → Hoàn tất.

---

## 6. Bước 3: Tạo Đánh giá (Testimonials)

**Vị trí:** Sidebar → **Đánh giá** → Nhấn **+ Tạo mới**

| Trường | Mô tả | Bắt buộc | Ví dụ |
|--------|-------|----------|-------|
| **Tên người đánh giá** | Tên học viên | ✅ | `Nguyễn Thị Lan Anh` |
| **Vai trò** | Nghề nghiệp / mô tả | ✅ | `Chủ tiệm bánh tại Hà Nội` |
| **Đoạn trích ngắn** | 1 câu highlight | ✅ | `Khóa học thay đổi sự nghiệp của tôi!` |
| **Nội dung đầy đủ** | Nhận xét chi tiết (3–5 câu) | ✅ | *(Đoạn văn)* |
| **Chữ ký** | Ký hiệu cuối | — | `Lan Anh - K12` |

> 💡 Nên có **3–6 đánh giá** đa dạng: học viên mới, cựu học viên, chủ tiệm...

---

## 7. Bước 4: Ghim Khóa học lên Slider trang chủ

**Vị trí:** Sidebar → **Sliders trang chủ**

### Giao diện

- **Phần trên — "Currently Featured":** Khóa học đang được ghim (viền xanh)
- **Phần dưới — "Available Programs":** Khóa học chưa ghim

### Thao tác

| Muốn làm gì | Thao tác |
|-------------|----------|
| **Ghim lên Slider** | Tìm khóa học ở phần dưới → Nhấn **Add to Slider** |
| **Gỡ khỏi Slider** | Tìm ở phần trên → Nhấn **Remove from Slider** |

> ⚠️ **Tối đa 3 khóa học** cùng lúc. Khi đủ 3, nút Add bị vô hiệu hóa → Gỡ bớt 1 rồi mới thêm mới.

---

## 8. Checklist hoàn tất

Sau khi upload xong, kiểm tra các mục sau trên website (mở tab mới → `http://103.143.142.245/baking/`):

| # | Kiểm tra | Cách kiểm tra |
|---|----------|--------------|
| 1 | Slider trang chủ có ảnh và tên khóa đúng? | Mở trang chủ, xem banner xoay |
| 2 | Card khóa học hiển thị đúng giá, ảnh, tên? | Nhấn menu "Khóa Học" |
| 3 | Chi tiết khóa học có đủ mô tả, giáo trình? | Nhấn vào 1 khóa bất kỳ |
| 4 | Nội dung Premium ẩn khi chưa mua? | Mở khóa khi chưa đăng nhập → không thấy tab Premium |
| 5 | Bài viết hiển thị đúng? | Nhấn menu "Cẩm nang" |
| 6 | Testimonials hiện trên trang chủ? | Cuộn xuống phần Đánh giá |
| 7 | Ảnh không bị vỡ? | Kiểm tra tất cả các trang |

> 💡 Nếu không thấy thay đổi → Nhấn **Ctrl + Shift + R** (Windows) hoặc **Cmd + Shift + R** (Mac) để xóa cache.

---

## 9. Xử lý lỗi thường gặp khi upload

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Upload ảnh bị lỗi | File > 5MB hoặc định dạng sai | Dùng JPG/PNG dưới 2MB |
| Ảnh đã upload nhưng không hiển thị | Cache trình duyệt | Ctrl + Shift + R |
| Lưu khóa học bị lỗi | Thiếu trường bắt buộc (tên < 5 ký tự, mô tả < 20 ký tự) | Kiểm tra lại các trường có dấu * |
| Bài viết không hiển thị trên trang chủ | Trang chủ chỉ show 3 bài mới nhất | Xem đầy đủ ở trang Cẩm nang |
| Link video Premium không chạy | Link sai format | Dán link YouTube/Vimeo bình thường, hệ thống tự convert |
| Tài liệu download không mở được | Link Google Drive chưa chia sẻ công khai | Vào Drive → Chuột phải → Chia sẻ → "Mọi người có link" |
| Khóa học không hiện trên Slider | Chưa ghim hoặc đã đủ 3 | Vào Sliders → Add to Slider |

---

### Quy trình tóm tắt — Upload 1 khóa học hoàn chỉnh

```
1. Chuẩn bị: ảnh thumbnail + nội dung mô tả + video bài giảng + tài liệu PDF
                                    ↓
2. Admin → Khóa học → + Tạo mới
                                    ↓
3. Tab 1: Điền tên, giá, danh mục
                                    ↓
4. Tab 2: Upload ảnh, viết mô tả, thêm kỹ năng + lợi ích
                                    ↓
5. Tab 3: Thêm các chương giáo trình
                                    ↓
6. Tab 4: Thêm video + tài liệu + hướng dẫn Premium
                                    ↓
7. Nhấn Lưu → Kiểm tra trên website
                                    ↓
8. Ghim lên Slider (nếu muốn hiện trên banner trang chủ)
```

---

*Tài liệu được biên soạn bởi đội ngũ phát triển NextLevel.*
*Phiên bản 1.0 — Cập nhật ngày 23/04/2026.*
