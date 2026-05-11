# Kịch bản Kiểm thử Thủ công: Tính năng Mã giảm giá (Promo Code)

Tài liệu này hướng dẫn chi tiết các bước kiểm thử thủ công cho tính năng Mã giảm giá trên hệ thống Baking (YUM Saigon), bao gồm cả giao diện Quản trị (Admin) và giao diện Khách hàng (Client).

## 1. Thông tin chung
- **Tính năng:** Quản lý và Áp dụng Mã giảm giá (Promo Code).
- **Đối tượng kiểm thử:** Admin (Quản trị viên) và Client (Học viên).
- **Môi trường:** Localhost hoặc Staging.

---

## 2. Kịch bản Kiểm thử (Test Cases)

### A. Luồng chuẩn (Happy Cases)

| ID | Tên Kịch Bản | Các Bước Thực Hiện (Actions) | Kết Quả Mong Đợi (Expected Results) |
|:---|:---|:---|:---|
| **TC-01** | Admin: Tạo mã giảm giá thủ công | 1. Vào Admin > Giảm giá & Tích điểm > Mã giảm giá.<br>2. Nhấn "Tạo mã mới".<br>3. Nhập mã (VD: GIAM20), chọn loại "Phần trăm", giá trị 20.<br>4. Nhấn "Tạo Mới". | Mã mới xuất hiện trong danh sách với đúng thông tin đã nhập. |
| **TC-02** | Admin: Tạo mã tự sinh | 1. Nhấn "Tạo mã mới".<br>2. Để trống ô "Mã", nhập các thông tin khác.<br>3. Nhấn "Tạo Mới". | Hệ thống tự sinh một mã ngẫu nhiên (8 ký tự) và lưu thành công. |
| **TC-03** | Admin: Chỉnh sửa mã | 1. Nhấn biểu tượng Sửa (bút chì) tại một mã.<br>2. Thay đổi giá trị hoặc ngày hết hạn.<br>3. Nhấn "Lưu Thay Đổi". | Thông tin mã được cập nhật chính xác trong danh sách. |
| **TC-04** | Admin: Xóa mã | 1. Nhấn biểu tượng Xóa (thùng rác) tại một mã.<br>2. Xác nhận xóa trong modal. | Mã biến mất khỏi danh sách. |
| **TC-05** | Admin: Thay đổi thứ tự ưu tiên | 1. Vào tab "Chế độ".<br>2. Kéo thả (Drag & Drop) các loại giảm giá (Mã giảm giá, Hạng TV, Điểm).<br>3. Nhấn "Lưu cấu hình". | Thứ tự mới được lưu. Khi Client thanh toán ở chế độ STACK, giảm giá sẽ áp dụng theo đúng thứ tự này. |
| **TC-06** | Client: Áp dụng mã PERCENTAGE | 1. Chọn khóa học, vào trang Checkout.<br>2. Chọn "Mã giảm giá", nhập mã giảm % hợp lệ.<br>3. Nhấn "Áp dụng". | - Hiện thông báo thành công.<br>- Số tiền giảm = Giá gốc * % giảm.<br>- Tổng thanh toán và VAT được tính lại chính xác. |
| **TC-07** | Client: Áp dụng mã FIXED | 1. Nhập mã giảm số tiền cố định (VD: 50.000đ).<br>2. Nhấn "Áp dụng". | - Số tiền giảm đúng bằng giá trị mã.<br>- Tổng thanh toán giảm tương ứng. |

### B. Dữ liệu sai & Lỗi logic (Bad Cases)

| ID | Tên Kịch Bản | Các Bước Thực Hiện (Actions) | Kết Quả Mong Đợi (Expected Results) |
|:---|:---|:---|:---|
| **TC-08** | Admin: Ngày kết thúc < Ngày bắt đầu | 1. Tạo/Sửa mã.<br>2. Chọn Ngày hết hạn trước Ngày bắt đầu. | Form hiển thị lỗi cảnh báo "Ngày hết hạn phải sau ngày bắt đầu" và không cho lưu. |
| **TC-09** | Client: Mã hết hạn / Chưa đến ngày | 1. Nhập mã đã quá hạn hoặc có ngày bắt đầu trong tương lai.<br>2. Nhấn "Áp dụng". | Hiện thông báo lỗi: "Mã giảm giá đã hết hạn" hoặc "Mã chưa có hiệu lực". |
| **TC-10** | Client: Đơn hàng không đủ giá trị tối thiểu | 1. Dùng mã có minOrderValue là 1.000.000đ cho đơn hàng 500.000đ. | Hiện thông báo lỗi: "Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này". |
| **TC-11** | Client: Vượt quá số lần sử dụng | 1. Dùng mã đã đạt giới hạn usageLimit. | Hiện thông báo lỗi: "Mã giảm giá đã hết lượt sử dụng". |
| **TC-12** | Client: Nhập mã không tồn tại | 1. Nhập một chuỗi ký tự ngẫu nhiên không có trong hệ thống. | Hiện thông báo lỗi: "Mã giảm giá không hợp lệ". |

### C. Bảo mật & Trường hợp biên (Security & Edge Cases)

| ID | Tên Kịch Bản | Các Bước Thực Hiện (Actions) | Kết Quả Mong Đợi (Expected Results) |
|:---|:---|:---|:---|
| **TC-13** | Admin: Nhập giá trị âm hoặc > 100% | 1. Thử tạo mã PERCENTAGE với giá trị -5 hoặc 110. | Backend chặn và trả về lỗi. Frontend hiển thị thông báo lỗi tương ứng. |
| **TC-14** | Client: Ép xung đột SINGLE mode | 1. Admin cấu hình chế độ "Chỉ 1 loại" (SINGLE).<br>2. Client cố tình dùng tool (Postman) gửi request chứa cả promoCode và pointsToUse. | Backend phải ưu tiên hoặc chặn, không được phép áp dụng cả hai nếu đang ở chế độ SINGLE. |
| **TC-15** | Client: Tấn công XSS | 1. Admin nhập mã chứa script: <script>alert('xss')</script>.<br>2. Client xem mã hoặc áp dụng mã. | Script không được thực thi. Mã được hiển thị dưới dạng text thuần túy (Sanitized). |
| **TC-16** | Client: Giá giảm lớn hơn giá gốc | 1. Dùng mã FIXED 1.000.000đ cho đơn hàng 800.000đ. | Tổng tiền trước VAT không được âm (thường về 0đ). VAT tính trên 0đ là 0đ. Tổng thanh toán là 0đ. |

### D. Kiểm tra Trải nghiệm (UX/UI Check)

| ID | Tên Kịch Bản | Các Bước Thực Hiện (Actions) | Kết Quả Mong Đợi (Expected Results) |
|:---|:---|:---|:---|
| **TC-17** | Định dạng tiền tệ | 1. Nhập giá trị vào ô "Đơn tối thiểu" hoặc "Giảm tối đa". | Số tiền tự động hiển thị dấu chấm phân cách hàng nghìn (VD: 1.000.000) để dễ đọc. |
| **TC-18** | Bộ chọn ngày tháng | 1. Click vào ô "Ngày bắt đầu" hoặc "Ngày hết hạn". | Lịch (Date picker) hiện ra ngay lập tức, không cần click thêm lần nữa. |
| **TC-19** | Trạng thái Loading | 1. Nhấn "Áp dụng" mã tại trang Checkout. | Nút "Áp dụng" hiển thị icon loading (spinner) trong khi chờ phản hồi từ server. |
| **TC-20** | Responsive Mobile | 1. Mở trang Quản lý mã giảm giá trên điện thoại hoặc giả lập Mobile. | Bảng danh sách mã giảm giá có thể cuộn ngang (scroll) hoặc hiển thị dạng card, không bị vỡ khung. |

---
**Người soạn:** AI QA Agent
**Ngày cập nhật:** 24/05/2024
