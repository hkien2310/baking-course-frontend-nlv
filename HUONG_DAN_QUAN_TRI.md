# 📘 Hướng Dẫn Quản Trị Website Muka Baking Course

> **Phiên bản:** 2.0 · **Cập nhật:** 17/04/2026  
> **Đối tượng:** Quản trị viên (Admin) website  
> **Địa chỉ trang web:** `http://<domain>/baking/`  
> **Địa chỉ Admin:** `http://<domain>/baking/auth`

---

## Mục lục

1. [Bắt đầu sử dụng](#1-bắt-đầu-sử-dụng)
2. [Tổng quan Dashboard](#2-tổng-quan-dashboard)
3. [Quản lý Giảng viên](#3-quản-lý-giảng-viên)
4. [Quản lý Khóa học](#4-quản-lý-khóa-học)
5. [Quản lý Bài viết & Cẩm nang](#5-quản-lý-bài-viết--cẩm-nang)
6. [Quản lý Đơn hàng & Thanh toán](#6-quản-lý-đơn-hàng--thanh-toán)
7. [Tin nhắn Liên hệ & Đăng ký bản tin](#7-tin-nhắn-liên-hệ--đăng-ký-bản-tin)
8. [Slider Trang chủ (Hero Banner)](#8-slider-trang-chủ-hero-banner)
9. [Đánh giá của học viên (Testimonials)](#9-đánh-giá-của-học-viên-testimonials)
10. [Luồng hoạt động của Khách hàng](#10-luồng-hoạt-động-của-khách-hàng)
11. [Câu hỏi thường gặp (FAQ)](#11-câu-hỏi-thường-gặp-faq)
12. [Xử lý sự cố](#12-xử-lý-sự-cố)

---

## 1. Bắt đầu sử dụng

### 1.1 Đăng nhập Admin

1. Mở trình duyệt, truy cập: `http://<domain>/baking/auth`
2. Nhập **Email** và **Mật khẩu** của tài khoản Admin
3. Nhấn nút **Đăng nhập**
4. Hệ thống kiểm tra quyền → Nếu là ADMIN → chuyển đến trang Quản trị

> ⚠️ **Lưu ý bảo mật:** Chỉ tài khoản có quyền ADMIN mới truy cập được. Tài khoản khách hàng thường sẽ được chuyển về trang Hồ sơ cá nhân.

### 1.2 Đăng xuất

Nhấn nút **🔓 Đăng xuất an toàn** ở cuối thanh menu bên trái.

### 1.3 Thứ tự khởi tạo nội dung (Website mới)

Khi website vừa dựng xong hoặc chưa có dữ liệu, hãy thực hiện theo thứ tự sau:

```
Bước 1 → Tạo Giảng viên (vì Khóa học yêu cầu chọn giảng viên)
Bước 2 → Tạo Khóa học
Bước 3 → Ghim Khóa học lên Slider trang chủ
Bước 4 → Viết Bài viết / Cẩm nang
Bước 5 → Thêm Đánh giá (Testimonials)
```

> 💡 **Tại sao phải theo thứ tự?** Vì khi tạo Khóa học, bạn cần chọn Giảng viên phụ trách từ danh sách có sẵn. Nếu chưa tạo Giảng viên nào thì danh sách sẽ trống.

---

## 2. Tổng quan Dashboard

Sau khi đăng nhập thành công, bạn thấy giao diện quản trị gồm **2 phần chính**:

### 2.1 Thanh menu bên trái (Sidebar)

Cố định ở bên trái màn hình, bao gồm các mục:

| Biểu tượng | Tên mục | Chức năng |
|-------------|---------|-----------|
| 📊 | **Tổng quan** | Xem thống kê tổng hợp |
| 💳 | **Đơn hàng** | Quản lý thanh toán khóa học |
| ✉️ | **Tin nhắn liên hệ** | Xem tin nhắn từ khách hàng |
| 📚 | **Khóa học** | Tạo, sửa, xóa khóa học |
| ✏️ | **Bài viết & Cẩm nang** | Quản lý blog, công thức |
| 🖼️ | **Sliders trang chủ** | Chọn khóa học hiển thị trên banner |
| 💬 | **Đánh giá** | Quản lý nhận xét học viên |
| 👤 | **Giảng viên** | Quản lý hồ sơ giảng viên |

### 2.2 Khu vực nội dung chính (bên phải)

Hiển thị nội dung tương ứng với mục đang chọn trên sidebar. Mặc định hiển thị **Tổng quan** với các thẻ thống kê:

| Thẻ | Ý nghĩa |
|-----|---------|
| **Khóa học** | Tổng số khóa học đã tạo |
| **Bài viết** | Tổng số bài blog / công thức |
| **Tin nhắn liên hệ** | Số tin nhắn từ form liên hệ + đăng ký bản tin |
| **Sliders trang chủ** | Số khóa học đang được ghim trên banner |
| **Đánh giá** | Số lượt đánh giá học viên |
| **Giảng viên** | Tổng số giảng viên |
| **Đơn hàng** | Tổng số đơn đặt mua |

> 💡 Nhấn vào bất kỳ thẻ thống kê nào sẽ chuyển nhanh đến mục quản lý tương ứng.

---

## 3. Quản lý Giảng viên

**Vị trí:** Sidebar → **Giảng viên**

### 3.1 Xem danh sách

Bảng hiển thị các cột: **Ảnh**, **Họ tên**, **Vị trí**, **Giới thiệu ngắn**, và nút **Sửa / Xóa**.

### 3.2 Thêm giảng viên mới

**Bước 1:** Nhấn nút **+ Tạo mới** (góc trên phải bảng)

**Bước 2:** Hộp thoại (popup) hiện ra. Điền các thông tin:

#### Thông tin cơ bản

| Trường | Mô tả | Bắt buộc | Ví dụ |
|--------|-------|----------|-------|
| **Họ tên** | Tên đầy đủ của giảng viên | ✅ | `Chef Marie Dubois` |
| **Vị trí / Chức danh** | Chuyên môn hoặc chức vụ | ✅ | `Đầu bếp Pháp — Chuyên gia bánh ngọt` |

#### Ảnh đại diện

- Nhấn nút **Chọn ảnh** → Chọn file từ máy tính → Ảnh tự động upload
- **Kích thước khuyến nghị:** `400 × 400px` (tỉ lệ vuông)
- **Định dạng:** JPG, PNG hoặc WebP

#### Giới thiệu & Tiểu sử

| Trường | Mô tả | Hiển thị ở đâu |
|--------|-------|----------------|
| **Giới thiệu ngắn** | 1–2 câu mô tả | Thẻ card giảng viên trên trang Giảng viên |
| **Thành tựu** | Các thành tựu nổi bật, ngăn cách bằng dấu `\|` | Tab "Tiểu sử" trong trang chi tiết |
| **Tiểu sử đầy đủ** | Nội dung chi tiết về sự nghiệp | Tab "Tiểu sử" trong trang chi tiết |

**Ví dụ trường Thành tựu:**
```
Giải nhất cuộc thi bánh Pháp 2022 | Hơn 15 năm kinh nghiệm | Từng làm việc tại Le Cordon Bleu
```

#### Mạng xã hội (tùy chọn)

| Trường | Ví dụ |
|--------|-------|
| **Facebook URL** | `https://facebook.com/chefmarie` |
| **Twitter URL** | `https://twitter.com/chefmarie` |
| **Instagram URL** | `https://instagram.com/chefmarie` |

#### Kỹ năng (Thanh phần trăm)

Hiển thị dưới dạng thanh tiến trình trên trang chi tiết giảng viên.

Mỗi kỹ năng gồm: **Tên** + **Phần trăm (0–100)**

| Tên kỹ năng | % |
|-------------|---|
| Nướng bánh Pháp | 95 |
| Trang trí bánh kem | 88 |
| Làm chocolate | 80 |

- Nhấn **+ Thêm Kỹ năng** để thêm dòng
- Nhấn 🗑️ để xóa dòng
- Kéo thả để sắp xếp (nếu hỗ trợ)

**Bước 3:** Nhấn **💾 Lưu Giảng Viên** → Hoàn tất

### 3.3 Sửa giảng viên

Nhấn **✏️ Sửa** ở hàng tương ứng → Popup hiện ra với dữ liệu đã điền sẵn → Chỉnh sửa → Nhấn **Lưu**.

### 3.4 Xóa giảng viên

Nhấn **🗑️ Xóa** → Xác nhận → Giảng viên bị xóa.

> ⚠️ **Cảnh báo:** Nếu giảng viên đang được gắn với khóa học, trang chi tiết khóa học sẽ không hiển thị thông tin giảng viên nữa. Hãy cập nhật giảng viên cho khóa học trước khi xóa.

---

## 4. Quản lý Khóa học

**Vị trí:** Sidebar → **Khóa học**

### 4.1 Xem danh sách

Bảng hiển thị: **Ảnh**, **Tiêu đề**, **Giá**, **Giảng viên**, **Thống kê** (số học viên / đánh giá), **Trạng thái**.

Ý nghĩa của các trạng thái:

| Badge | Ý nghĩa |
|-------|---------|
| 🟢 **ĐANG DIỄN RA** | Khóa học có lịch học đang trong thời gian hoạt động |
| 🟡 **SẮP DIỄN RA** | Có lịch học trong tương lai |
| 🔴 **ĐÃ KẾT THÚC** | Tất cả lịch học đã qua |
| ⚪ **BẢN NHÁP** | Chưa có lịch học nào |

### 4.2 Tạo khóa học mới — Hướng dẫn từng bước

**Bước 1:** Nhấn nút **+ Tạo mới** → Chuyển sang trang **Trình soạn thảo khóa học**

Giao diện gồm thanh nút phía trên (Quay lại + Lưu) và bên dưới chia thành các khối (block) thông tin.

---

#### KHỐI 1: Thông tin chung

| Trường | Mô tả | Bắt buộc | Ghi chú |
|--------|-------|----------|---------|
| **Tên Khóa Học** | Tiêu đề chính, tối thiểu 5 ký tự | ✅ | Hệ thống tự tạo đường dẫn (slug) từ tiêu đề. VD: `lam-banh-ngot-phap` |
| **Giá (đ)** | Giá bán bằng VNĐ | ✅ | Nhập số nguyên, VD: `500000` = 500.000đ. Nhập `0` = Miễn phí (không cần thanh toán) |
| **Giảng viên** | Chọn từ danh sách dropdown | ✅ | Nếu danh sách trống → quay lại [mục 3](#3-quản-lý-giảng-viên) tạo giảng viên trước |
| **Ảnh Đại Diện** | Ấn **Chọn ảnh** upload từ máy tính | — | Kích thước khuyến nghị: `800 × 600px` |
| **Mô tả tổng quát** | Giới thiệu ngắn gọn, tối thiểu 20 ký tự | ✅ | Hiển thị ở trang chi tiết và khi chia sẻ link |

---

#### KHỐI 2: Mục tiêu khóa học (Thanh Kỹ Năng)

Hiển thị trên trang chi tiết khóa học dưới dạng **thanh tiến trình** (progress bar).

**Cách thêm:**

1. Nhấn **+ Thêm Kỹ Năng**
2. Điền **Tên kỹ năng** và **Phần trăm %**
3. Lặp lại cho mỗi mục tiêu

**Ví dụ thực tế:**

| Tên kỹ năng | % |
|-------------|---|
| Kỹ thuật nhồi bột | 90 |
| Trang trí bánh kem | 85 |
| Vệ sinh an toàn thực phẩm | 95 |
| Quản lý chi phí nguyên liệu | 70 |

> 💡 Nên thêm 3–5 mục tiêu. Phần trăm mang tính minh họa, không cần chính xác tuyệt đối.

---

#### KHỐI 3: Lợi ích khóa học

Liệt kê những gì học viên nhận được khi tham gia. Mỗi dòng = 1 lợi ích.

**Cách thêm:**

1. Nhấn **+ Thêm Lợi Ích**
2. Nhập nội dung

**Ví dụ:**

```
✦ Hơn 20 video bài giảng chất lượng cao
✦ Tài liệu PDF chi tiết từng công thức
✦ Chứng nhận hoàn thành có giá trị
✦ Hỗ trợ trực tuyến từ giảng viên
✦ Cập nhật nội dung miễn phí trọn đời
```

---

#### KHỐI 4: Chương Trình Học (Curriculum)

Thể hiện cấu trúc bài học theo từng **Chương**.

**Cách thêm:**

1. Nhấn **+ Thêm Chương Mới**
2. Điền **Tiêu đề chương** (bắt buộc)
3. Điền **Nội dung** mô tả chương (tối thiểu 10 ký tự)

**Ví dụ:**

| Chương | Tiêu đề | Nội dung |
|--------|---------|----------|
| 1 | Tìm Hiểu Nguyên Liệu | Phân loại bột mì, cách chọn bơ, trứng, kem tươi. So sánh nguyên liệu châu Âu và Việt Nam. |
| 2 | Kỹ Thuật Nhồi Bột | Các kỹ thuật nhồi: gấp, cuộn, kéo. Cách đánh giá bột đạt chuẩn qua cảm nhận tay. |
| 3 | Nướng & Kiểm Soát Nhiệt Độ | Cài đặt lò nướng, phân vùng nhiệt, thời gian nướng cho từng loại bánh. |
| 4 | Trang Trí & Hoàn Thiện | Phủ kem, tạo hoa văn, sử dụng màu thực phẩm, đóng gói bảo quản. |

> 💡 Trang chi tiết khóa học sẽ hiện curriculum dạng danh sách accordion (bấm mở/đóng). Nội dung chi tiết **chỉ hiện khi học viên đã mua khóa học**.

---

#### KHỐI 5: Nội Dung Premium (★ Chỉ dành cho người mua)

Đây là phần quan trọng nhất — **nội dung chỉ mở khóa sau khi học viên thanh toán thành công**.

##### 5a. Video Bài Giảng

Mỗi video gồm **Tiêu đề** + **Link nhúng**:

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| **Tiêu đề video** | Tên hiển thị | `Bài 1: Giới thiệu khóa học` |
| **Link nhúng** | URL video từ YouTube, Vimeo hoặc Google Drive | `https://www.youtube.com/embed/xxxxx` |

**Cách lấy link nhúng YouTube:**

1. Mở video trên YouTube
2. Nhấn **Chia sẻ** → **Nhúng**
3. Copy phần link trong `src="..."`. VD: `https://www.youtube.com/embed/dQw4w9WgXcQ`

> ⚠️ **Quan trọng:** Dùng link dạng `/embed/` chứ KHÔNG phải link `youtube.com/watch?v=...`

##### 5b. Tài nguyên tải xuống

Mỗi tài nguyên gồm **Tên** + **Link tải**:

| Trường | Ví dụ |
|--------|-------|
| **Tên tài nguyên** | `Tài liệu công thức PDF` |
| **Link tải** | `https://drive.google.com/file/d/.../view` |

> 💡 Có thể dùng Google Drive, Dropbox hoặc bất kỳ dịch vụ lưu trữ nào. Đảm bảo link được **chia sẻ công khai**.

##### 5c. Hướng dẫn chi tiết

Ô nhập liệu dạng văn bản dài, **hỗ trợ HTML**.

**Ví dụ:**

```html
<h3>📋 Hướng dẫn cho học viên</h3>
<p>Chào mừng bạn đến với khóa học! Dưới đây là cách học hiệu quả nhất:</p>
<ol>
  <li>Xem video theo thứ tự từ Bài 1 → Bài cuối</li>
  <li>Tải tài liệu PDF và in ra để ghi chú</li>
  <li>Thực hành mỗi công thức ít nhất 2 lần</li>
  <li>Gửi hình ảnh thành phẩm qua email để nhận nhận xét</li>
</ol>
<p><strong>Liên hệ hỗ trợ:</strong> lienhe@muka.vn</p>
```

---

**Bước cuối cùng:** Nhấn **💾 Lưu Khóa Học** ở thanh trên cùng.

### 4.3 Sửa khóa học

Trong bảng danh sách, nhấn **✏️ Sửa** → Chuyển sang trang soạn thảo với dữ liệu đã điền sẵn → Chỉnh sửa → Nhấn **Lưu**.

### 4.4 Xóa khóa học

Nhấn **🗑️ Xóa** → Hộp thoại xác nhận → Đồng ý → Khóa học bị xóa.

> ⚠️ **Không thể hoàn tác.** Đơn hàng liên quan (đã thanh toán) vẫn được lưu trữ trong hệ thống nhưng khóa học sẽ không còn hiển thị trên trang web.

---

## 5. Quản lý Bài viết & Cẩm nang

**Vị trí:** Sidebar → **Bài viết & Cẩm nang**

### 5.1 Xem danh sách

Bảng hiển thị: Ảnh, Tiêu đề, Chuyên mục, Loại (Blog/Công thức), Ngày, Thao tác.

### 5.2 Tạo bài viết mới — Hướng dẫn từng bước

**Bước 1:** Nhấn **+ Tạo mới** → Chuyển sang trang soạn thảo 2 cột

Giao diện chia ra:
- **Cột trái:** Form nhập nội dung
- **Cột phải:** Xem trước bài viết (cập nhật theo thời gian thực)

**Bước 2:** Điền thông tin

| Trường | Mô tả | Bắt buộc | Ghi chú |
|--------|-------|----------|---------|
| **Tiêu đề** | Tên bài viết, tối thiểu 5 ký tự | ✅ | Slug (đường dẫn) tự động tạo khi lưu |
| **Loại** | `Bài Viết Blog` hoặc `Công Thức` | — | Mặc định: Blog |
| **Chuyên mục** | Chọn từ danh sách có sẵn HOẶC nhập mới | — | Nhập vào ô bên dưới nếu muốn tạo chuyên mục mới |
| **Tên Tác Giả** | Người viết | — | Mặc định: `Admin` |
| **Ngày Hiển Thị** | Chuỗi ngày tùy chỉnh | — | VD: `15 Thg 4, 2026` |
| **Ảnh Đại Diện** | Upload từ máy tính | — | Kích thước khuyến nghị: `1200 × 675px` |
| **Mô tả ngắn** | Đoạn trích hiển thị trên thẻ card | — | Nên viết 1–2 câu hấp dẫn |
| **Nội dung chi tiết** | Viết bằng **HTML** | ✅ | Tối thiểu 50 ký tự |

**Bước 3:** Viết nội dung HTML

Vì trình soạn thảo hiện tại dùng code HTML thuần, đây là các thẻ HTML phổ biến bạn có thể dùng:

```
TIÊU ĐỀ:
<h2>Tiêu đề lớn</h2>
<h3>Tiêu đề vừa</h3>
<h4>Tiêu đề nhỏ</h4>

ĐOẠN VĂN:
<p>Đây là một đoạn văn bình thường.</p>
<p><strong>Chữ in đậm</strong> và <em>chữ nghiêng</em></p>

DANH SÁCH:
<ul>
  <li>Mục 1</li>
  <li>Mục 2</li>
</ul>

DANH SÁCH CÓ SỐ:
<ol>
  <li>Bước 1</li>
  <li>Bước 2</li>
</ol>

TRÍCH DẪN:
<blockquote>Đây là đoạn trích dẫn nổi bật</blockquote>

HÌNH ẢNH:
<img src="LINK_ẢNH" alt="Mô tả ảnh" />

LINK:
<a href="https://example.com">Nhấn vào đây</a>
```

**Ví dụ bài viết hoàn chỉnh:**

```html
<h2>Bí quyết làm bánh Croissant xốp mềm</h2>

<p>Croissant là loại bánh đặc trưng của Pháp, nổi tiếng với lớp vỏ giòn rụm
và ruột xốp mịn. Bài viết hôm nay sẽ chia sẻ công thức được Chef Marie
hoàn thiện sau 15 năm kinh nghiệm.</p>

<h3>Nguyên liệu (cho 12 chiếc)</h3>
<ul>
  <li>500g bột mì số 13</li>
  <li>250g bơ Président (lạnh)</li>
  <li>10g muối, 60g đường</li>
  <li>7g men khô</li>
  <li>250ml sữa tươi</li>
</ul>

<h3>Các bước thực hiện</h3>
<ol>
  <li><strong>Trộn bột:</strong> Đổ bột mì, muối, đường, men vào thau.
  Thêm sữa từ từ, nhồi 10 phút.</li>
  <li><strong>Ủ bột:</strong> Bọc bột bằng màng thực phẩm, ủ tủ lạnh 1 giờ.</li>
  <li><strong>Cán bơ:</strong> Đập bơ thành tấm mỏng, đặt lên bột,
  gấp 3 lần × 3 lượt. Nghỉ tủ lạnh sau mỗi lượt.</li>
  <li><strong>Tạo hình:</strong> Cán mỏng 4mm, cắt tam giác, cuộn từ
  đáy lên đỉnh.</li>
  <li><strong>Nướng:</strong> 200°C trong 15–18 phút đến khi vàng đều.</li>
</ol>

<blockquote>
  💡 Mẹo từ Chef Marie: Bơ phải lạnh cứng nhưng không quá đông.
  Nếu bơ chảy ra khi cán, hãy cho vào tủ lạnh thêm 15 phút.
</blockquote>
```

> 💡 **Mẹo:** Cột **Xem trước** bên phải sẽ hiển thị kết quả ngay lập tức khi bạn gõ. Hãy kiểm tra bố cục trước khi lưu.

**Bước 4:** Nhấn **💾 Lưu Bài Viết** → Hoàn tất

### 5.3 Sửa / Xóa bài viết

Trong bảng danh sách → **✏️ Sửa** hoặc **🗑️ Xóa** tương tự như khóa học.

---

## 6. Quản lý Đơn hàng & Thanh toán

**Vị trí:** Sidebar → **Đơn hàng**

### 6.1 Tổng quan luồng thanh toán

```
Học viên bấm "Mua khóa học"
        ↓
Hệ thống tạo Đơn hàng (PENDING)
        ↓
Chuyển hướng sang cổng VNPay
        ↓
Học viên thanh toán tại VNPay
        ↓
  ┌─ Thành công → VNPay gửi tín hiệu về → Tự động CONFIRMED → Mở khóa nội dung
  ├─ Hủy → CANCELLED
  └─ Thất bại → REJECTED
```

### 6.2 Các trạng thái đơn hàng

| Trạng thái | Màu | Ý nghĩa | Admin cần làm gì? |
|------------|-----|---------|-------------------|
| **PENDING** | 🟡 Vàng | Đơn mới tạo, chưa thanh toán | Chờ hoặc nhắc học viên thanh toán |
| **AWAITING_CONFIRM** | 🔵 Xanh dương | Đã có bằng chứng thanh toán, chờ duyệt | **Cần xem và xác nhận** |
| **CONFIRMED** | 🟢 Xanh lá | Đã thanh toán thành công | Không cần làm gì — Nội dung đã mở khóa |
| **REJECTED** | 🔴 Đỏ | Admin từ chối thanh toán | Học viên có thể thử thanh toán lại |
| **CANCELLED** | ⚫ Xám | Học viên tự hủy đơn | Không cần làm gì |

### 6.3 Bộ lọc nhanh

Phía trên bảng có các nút lọc: **All**, **PENDING**, **AWAITING_CONFIRM**, **CONFIRMED**, **REJECTED**. Mỗi nút hiển thị số lượng đơn tương ứng.

### 6.4 Xem chi tiết đơn hàng

Nhấn **👁️ View** → Popup hiện ra với đầy đủ thông tin:

| Mục | Nội dung |
|-----|----------|
| **Học viên** | Họ tên + Email |
| **Khóa học** | Tên khóa + Giá |
| **Trạng thái** | Badge màu |
| **Nội dung chuyển khoản** | Mã đơn hàng dùng khi chuyển khoản |
| **Phương thức** | VNPay / Manual / Webhook |
| **Thông tin VNPay** | Mã giao dịch API, Mã GD ngân hàng, Mã phản hồi, Thời gian thanh toán |

### 6.5 Xác nhận đơn hàng (Thủ công)

> 💡 Phần lớn đơn qua VNPay sẽ **tự động xác nhận**. Mục này chỉ cần dùng khi có đơn bị treo hoặc thanh toán thủ công.

1. Mở chi tiết đơn hàng (nhấn **View**)
2. Nhập **Ghi chú Admin** (tùy chọn). VD: `Đã kiểm tra sao kê ngân hàng`
3. Nhấn **✅ Xác nhận Thanh toán**
4. Hệ thống tự động:
   - Chuyển trạng thái → **CONFIRMED**
   - Tạo bản ghi ghi danh (Enrollment) cho học viên
   - **Mở khóa nội dung Premium** cho khóa học đó

### 6.6 Từ chối đơn hàng

1. Mở chi tiết đơn hàng
2. Nhập **Ghi chú Admin** (**bắt buộc** — ghi rõ lý do). VD: `Không tìm thấy giao dịch phù hợp trong sao kê`
3. Nhấn **❌ Từ chối**
4. Học viên sẽ thấy trạng thái đơn bị từ chối và có thể thử thanh toán lại

---

## 7. Tin nhắn Liên hệ & Đăng ký bản tin

**Vị trí:** Sidebar → **Tin nhắn liên hệ**

### Nguồn tin nhắn

Mục này tập hợp tin nhắn từ **2 nguồn** trên website:

| Nguồn | Vị trí trên website | Chủ đề hiển thị |
|-------|---------------------|-----------------|
| **Form Liên hệ** | Trang chủ — Mục "Liên hệ" | Do khách hàng tự nhập |
| **Đăng ký bản tin** | Footer (cuối mỗi trang) | `Đăng ký nhận bản tin (Newsletter)` |

### Thông tin hiển thị

Bảng gồm: **Ngày**, **Họ tên**, **Email**, **Chủ đề**, **Nội dung**, **Thao tác** (Xóa).

### Thao tác

- **Đọc nội dung đầy đủ:** Di chuột vào cột Nội dung → Tooltip hiện toàn bộ
- **Xóa:** Nhấn 🗑️ → Xác nhận → Tin nhắn bị xóa

> 💡 **Gợi ý:** Kiểm tra mục này mỗi ngày để không bỏ lỡ yêu cầu học viên. Đặc biệt chú ý các tin nhắn có chủ đề khác `Đăng ký nhận bản tin` — đó là câu hỏi thực sự từ khách hàng cần trả lời.

---

## 8. Slider Trang chủ (Hero Banner)

**Vị trí:** Sidebar → **Sliders trang chủ**

### Chức năng

Chọn **tối đa 3 khóa học** hiển thị trên banner xoay (hero slider) ở đầu trang chủ. Banner tự động chuyển đổi mỗi 7 giây.

### Giao diện

- **Phần trên — "Currently Featured":** Các khóa học đang được ghim (viền xanh)
- **Phần dưới — "Available Programs":** Tất cả khóa học chưa ghim

### Thao tác

| Muốn làm gì | Thao tác |
|-------------|----------|
| **Ghim lên Slider** | Tìm khóa học ở phần dưới → Nhấn **Add to Slider** |
| **Gỡ khỏi Slider** | Tìm khóa học ở phần trên → Nhấn **Remove from Slider** |

### Giới hạn

- **Tối đa 3** khóa học cùng lúc
- Khi đã đủ 3, nút **Add** sẽ bị vô hiệu hóa (xám) → Gỡ bớt 1 rồi mới thêm mới

> 💡 Nên ghim các khóa học **đang mở bán** hoặc **mới nhất** để thu hút khách hàng.

---

## 9. Đánh giá của học viên (Testimonials)

**Vị trí:** Sidebar → **Đánh giá**

### Chức năng

Quản lý các **nhận xét của học viên** hiển thị trên trang chủ (phần "Testimonials").

### Tạo đánh giá mới

Nhấn **+ Tạo mới** → Popup hiện ra:

| Trường | Mô tả | Bắt buộc | Ví dụ |
|--------|-------|----------|-------|
| **Tên người đánh giá** | Tên học viên | ✅ | `Nguyễn Thị Lan Anh` |
| **Vai trò / Nghề nghiệp** | Mô tả ngắn về người đánh giá | ✅ | `Chủ tiệm bánh tại Hà Nội` |
| **Đoạn trích ngắn** | 1 câu highlight, hiển thị trên card | ✅ | `Khóa học thay đổi sự nghiệp của tôi!` |
| **Nội dung đầy đủ** | Nhận xét chi tiết | ✅ | (Đoạn văn 3–5 câu) |
| **Chữ ký** | Ký hiệu cuối nhận xét | — | `Lan Anh - K12` |

> 💡 **Gợi ý:** Nên có **3–6 đánh giá** để hiển thị đẹp trên carousel trang chủ. Các nhận xét nên đa dạng: học viên mới, học viên cũ, chủ tiệm, v.v.

---

## 10. Luồng hoạt động của Khách hàng

Phần này giúp Admin hiểu cách khách hàng tương tác với website.

### 10.1 Luồng mua khóa học

```
Khách vào trang Khóa Học → Chọn khóa → Xem chi tiết
                                            ↓
                                    Nhấn "Mua khóa học"
                                            ↓
                              ┌── Chưa đăng nhập → Chuyển trang Đăng nhập/Đăng ký
                              └── Đã đăng nhập → Chuyển trang Thanh Toán (Checkout)
                                            ↓
                                  Xem tóm tắt đơn hàng
                                            ↓
                                  Nhấn "Trả tiền qua VNPay"
                                            ↓
                              Chuyển hướng sang cổng VNPay
                                            ↓
                              Thanh toán (ATM/Ví/QR/Thẻ)
                                            ↓
                        ┌── Thành công → Trang "Kết quả giao dịch" → Xem khóa học
                        ├── Hủy → Quay lại trang Checkout
                        └── Thất bại → Thông báo lỗi → Có thể thử lại
```

### 10.2 Luồng xem nội dung Premium

```
Học viên đã mua → Vào trang chi tiết khóa học
                        ↓
                  Hiển thị tab "Premium"
                        ↓
            ┌── Video: Xem trực tiếp trên trang
            ├── Tài liệu: Nhấn link tải về
            └── Hướng dẫn: Đọc trực tiếp
```

### 10.3 Luồng liên hệ

```
Khách nhấn "Liên hệ" trên trang chủ → Điền form → Gửi
                        ↓
              Admin thấy trong mục "Tin nhắn liên hệ"
```

### 10.4 Luồng đăng ký bản tin

```
Khách nhập Email ở Footer → Nhấn "Đăng ký"
                        ↓
              Admin thấy trong mục "Tin nhắn liên hệ"
              (Chủ đề: "Đăng ký nhận bản tin")
```

---

## 11. Câu hỏi thường gặp (FAQ)

### Q: Tôi quên mật khẩu Admin, làm sao đăng nhập?
**A:** Liên hệ đội ngũ kỹ thuật để reset mật khẩu. Hiện tại hệ thống chưa có tính năng "Quên mật khẩu" tự động.

### Q: Khóa học giá 0 đồng thì học viên có cần thanh toán không?
**A:** Không. Khóa học miễn phí (giá = 0) sẽ hiển thị nút **"Đăng ký — Miễn phí"** thay vì nút "Mua khóa học". Học viên nhấn vào là được mở khóa ngay.

### Q: Tôi muốn chỉnh sửa giá khóa học sau khi đã có người mua. Có ảnh hưởng đơn cũ không?
**A:** Không. Giá trong đơn hàng được **chụp lại tại thời điểm tạo đơn**. Thay đổi giá chỉ ảnh hưởng đơn hàng mới.

### Q: Đơn hàng VNPay bị treo ở trạng thái PENDING quá lâu?
**A:** Có thể xảy ra khi:
1. Học viên thoát VNPay mà không thanh toán
2. Tín hiệu xác nhận (IPN) từ VNPay bị lỗi mạng

**Cách xử lý:** Kiểm tra trên hệ thống VNPay (nếu có quyền truy cập) hoặc nhờ đội ngũ kỹ thuật kiểm tra log. Nếu đã nhận tiền, Admin có thể **Xác nhận thủ công** trong mục Đơn hàng.

### Q: Ảnh bài viết / khóa học bị vỡ hoặc không hiển thị?
**A:** Có thể do:
1. Ảnh chưa upload thành công → Thử upload lại
2. Cache trình duyệt → Nhấn **Ctrl + Shift + R** (Windows) hoặc **Cmd + Shift + R** (Mac) để xóa cache

### Q: Tôi thêm bài viết nhưng không thấy trên trang chủ?
**A:** Trang chủ chỉ hiển thị **3 bài viết mới nhất**. Bài mới thêm sẽ tự động đẩy bài cũ xuống. Tất cả bài viết đều hiển thị trên trang **Blog** (menu: Cẩm nang).

### Q: Học viên báo không thấy nội dung Premium sau khi thanh toán?
**A:** Kiểm tra:
1. Đơn hàng đã ở trạng thái **CONFIRMED** chưa? (Xem mục Đơn hàng)
2. Nếu chưa → Xác nhận thủ công
3. Nếu đã CONFIRMED → Yêu cầu học viên **đăng xuất và đăng nhập lại** hoặc **xóa cache trình duyệt**

---

## 12. Xử lý sự cố

| Tình huống | Nguyên nhân | Cách xử lý |
|-----------|-------------|------------|
| Không đăng nhập được Admin | Sai mật khẩu hoặc tài khoản không có quyền ADMIN | Liên hệ kỹ thuật reset mật khẩu |
| Trang web load chậm / trắng | Cache trình duyệt cũ | Ctrl + Shift + R (xóa cache và tải lại) |
| Upload ảnh bị lỗi | File quá lớn (>5MB) hoặc định dạng không hỗ trợ | Dùng JPG/PNG dưới 2MB, kích thước phù hợp |
| Đơn VNPay thành công nhưng vẫn PENDING | IPN webhook bị timeout | Admin xác nhận thủ công trong mục Đơn hàng |
| Khóa học không hiện trên trang chủ | Chưa ghim lên Slider | Vào mục Sliders → Add to Slider |
| Sửa nội dung nhưng trang web không thay đổi | Cache trình duyệt | Ctrl + Shift + R hoặc chờ 5 phút |

### Liên hệ hỗ trợ kỹ thuật

Khi gặp sự cố ngoài phạm vi trên, vui lòng gửi email cho đội phát triển kèm:

1. **Ảnh chụp màn hình** lỗi (bao gồm thanh địa chỉ URL)
2. **Thời gian** xảy ra sự cố
3. **Mô tả** các bước đã thực hiện trước khi gặp lỗi
4. **Trình duyệt** đang sử dụng (Chrome, Safari, Firefox...)

---

### Bảng tóm tắt kích thước ảnh khuyến nghị

| Loại ảnh | Kích thước | Tỉ lệ |
|----------|-----------|--------|
| Ảnh khóa học (thumbnail) | 800 × 600 px | 4:3 |
| Ảnh giảng viên | 400 × 400 px | 1:1 (vuông) |
| Ảnh bài viết | 1200 × 675 px | 16:9 |
| Định dạng khuyến nghị | JPG hoặc WebP | — |
| Dung lượng tối đa | 2 MB | — |

---

*Tài liệu được biên soạn bởi đội ngũ phát triển NextLevel.*  
*Phiên bản 2.0 — Cập nhật ngày 17/04/2026.*  
*Mọi quyền được bảo lưu. ©*
