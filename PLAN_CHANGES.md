# Cập nhật Baking Platform — Chi tiết từng bước

> [!IMPORTANT]
> Plan này được viết cực kì chi tiết để model nhẹ có thể thực thi từng task một cách cơ học.
> Mỗi task có: file path, exact code to find, exact code to replace.

---

## TASK 1: Database — Thêm `salePrice` vào schema

**File:** `/Users/hoangkien/NLV/baking/backend/prisma/schema.prisma`
**Action:** Thêm 1 dòng `salePrice Int?` ngay sau dòng `price Int?` (line 58)

**Find (line 58):**
```
  price       Int?
```
**Replace with:**
```
  price       Int?
  salePrice   Int?
```

**Sau đó chạy command:**
```bash
cd /Users/hoangkien/NLV/baking/backend && npx prisma db push
```

---

## TASK 2: Admin Editor — Thêm input Giá khuyến mãi

**File:** `/Users/hoangkien/NLV/baking/frontend/src/pages/AdminProgramEditor.jsx`

### 2a. Thêm `salePrice` vào formData init (line 38-43 trong useEffect khi editing)

**Find:**
```
            price: prog.price != null ? priceToDollars(prog.price) : '',
```
**Replace with:**
```
            price: prog.price != null ? priceToDollars(prog.price) : '',
            salePrice: prog.salePrice != null ? priceToDollars(prog.salePrice) : '',
```

### 2b. Thêm `salePrice` vào payload khi save (line 77-80)

**Find:**
```
      const payload = {
        ...formData,
        price: formData.price ? dollarsToCents(formData.price) : null
      };
```
**Replace with:**
```
      const payload = {
        ...formData,
        price: formData.price ? dollarsToCents(formData.price) : null,
        salePrice: formData.salePrice ? dollarsToCents(formData.salePrice) : null
      };
```

### 2c. Thêm input Giá KM bên cạnh input Giá (line 160-176)

**Find:**
```
          <div className="row mt-3">
            <div className="col-md-6">
              <AdminInput label={<>Giá (đ) <span className="text-danger">*</span></>} name="price" type="number" step="1000" min="0" value={formData.price} onChange={handleChange} placeholder="500000" required />
            </div>
            <div className="col-md-6">
              <AdminSelect 
                label={<>Giảng viên <span className="text-danger">*</span></>} 
                name="chiefId" 
                value={formData.chiefId} 
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Chọn Giảng viên --' },
                  ...chiefsList.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
          </div>
```
**Replace with:**
```
          <div className="row mt-3">
            <div className="col-md-4">
              <AdminInput label={<>Giá gốc (đ) <span className="text-danger">*</span></>} name="price" type="number" step="1000" min="0" value={formData.price} onChange={handleChange} placeholder="500000" required />
            </div>
            <div className="col-md-4">
              <AdminInput label="Giá khuyến mãi (đ)" name="salePrice" type="number" step="1000" min="0" value={formData.salePrice || ''} onChange={handleChange} placeholder="Để trống nếu không KM" />
            </div>
            <div className="col-md-4">
              <AdminSelect 
                label={<>Giảng viên <span className="text-danger">*</span></>} 
                name="chiefId" 
                value={formData.chiefId} 
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Chọn Giảng viên --' },
                  ...chiefsList.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
          </div>
```

---

## TASK 3: Utility helpers — Format số học viên + tính % giảm giá

**File:** `/Users/hoangkien/NLV/baking/frontend/src/utils/formatters.js`
**Action:** Thêm 2 function mới **ở cuối file**, trước dòng cuối cùng.

**Append sau function `getOrderStatusBadge` (sau line 52):**
```javascript

/**
 * Format student count for display: 1600 → "1,6k", 813 → "813"
 * @param {number} count
 * @returns {string}
 */
export const formatStudentCount = (count) => {
  if (count == null || count === 0) return '0';
  if (count >= 1000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1).replace('.0', '')}k`;
  }
  return count.toLocaleString('vi-VN');
};

/**
 * Calculate discount percentage between original price and sale price
 * @param {number} price - Original price
 * @param {number} salePrice - Sale price
 * @returns {number|null} Discount percentage or null
 */
export const calcDiscountPercent = (price, salePrice) => {
  if (!price || !salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
};
```

---

## TASK 4: Redesign ProgramCard — Kiểu caogiang.vn

**File:** `/Users/hoangkien/NLV/baking/frontend/src/components/Shared/ProgramCard.jsx`
**Action:** Thay thế toàn bộ nội dung file

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatPrice, formatStudentCount, calcDiscountPercent } from '../../utils/formatters';

const ProgramCard = ({ cls }) => {
  const navigate = useNavigate();
  const effectivePrice = cls.salePrice || cls.price;
  const discountPercent = calcDiscountPercent(cls.price, cls.salePrice);

  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(ROUTES.PROGRAM_DETAIL(cls.slug));
  };

  return (
    <div className="vertical-item text-center bordered program-card-v2">
      <div className="item-media" style={{ position: 'relative' }}>
        <img src={cls.thumbnail} alt={cls.title} style={{ objectFit: 'cover', width: '100%', aspectRatio: '4/3' }} />
        <div className="media-links">
          <Link className="abs-link" to={ROUTES.PROGRAM_DETAIL(cls.slug)}></Link>
        </div>
        {discountPercent && (
          <span className="discount-badge">-{discountPercent}%</span>
        )}
      </div>
      <div className="item-content">
        <h5>
          <Link to={ROUTES.PROGRAM_DETAIL(cls.slug)}>{cls.title}</Link>
        </h5>
        <p className="card-desc">{cls.description}</p>
      </div>
      <div className="program-card-footer">
        <div className="card-stats">
          <span className="stat-item">
            <i className="fa fa-users"></i> {formatStudentCount(cls.students)}
          </span>
          <span className="stat-item">
            <i className="fa fa-comments"></i> {cls.reviews || 0}
          </span>
        </div>
        <div className="card-pricing">
          {cls.salePrice && cls.price > cls.salePrice ? (
            <>
              <span className="price-original">{formatPrice(cls.price)}</span>
              <span className="price-sale">{formatPrice(cls.salePrice)}</span>
            </>
          ) : (
            <span className="price-sale">{formatPrice(cls.price)}</span>
          )}
        </div>
        <button className="btn-buy-card" onClick={handleBuyClick}>
          <i className="fa fa-shopping-cart"></i> MUA NGAY
        </button>
      </div>
    </div>
  );
};

export default ProgramCard;
```

---

## TASK 5: CSS cho ProgramCard mới

**File:** `/Users/hoangkien/NLV/baking/frontend/src/App.css`
**Action:** Append CSS mới ở cuối file

```css

/* ═══ Program Card V2 — caogiang.vn style ═══ */
.program-card-v2 {
  transition: transform 0.25s, box-shadow 0.25s;
  border-radius: 12px;
  overflow: hidden;
}
.program-card-v2:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.program-card-v2 .item-media { position: relative; overflow: hidden; }
.program-card-v2 .item-media img { transition: transform 0.4s; }
.program-card-v2:hover .item-media img { transform: scale(1.05); }

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #e74c3c;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  z-index: 2;
  line-height: 1.2;
}

.program-card-v2 .item-content { padding: 16px 16px 8px; }
.program-card-v2 .item-content h5 { font-size: 16px; line-height: 1.4; min-height: 44px; }
.program-card-v2 .card-desc {
  font-size: 13px;
  color: #777;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0;
}

.program-card-footer {
  padding: 12px 16px 16px;
  border-top: 1px solid #f0f0f0;
}

.card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}
.stat-item {
  font-size: 13px;
  color: #888;
}
.stat-item i {
  color: #c19a5b;
  margin-right: 4px;
}

.card-pricing {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.price-original {
  text-decoration: line-through;
  color: #aaa;
  font-size: 14px;
}
.price-sale {
  color: #e74c3c;
  font-size: 18px;
  font-weight: 700;
}

.btn-buy-card {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #c19a5b, #d4af73);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
}
.btn-buy-card:hover {
  background: linear-gradient(135deg, #a88545, #c19a5b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(193,154,91,0.3);
}
.btn-buy-card i { margin-right: 6px; }
```

---

## TASK 6: Homepage — Đổi thứ tự sections + tạo HomeNewCourses

### 6a. Tạo component mới `HomeNewCourses.jsx`

**File (NEW):** `/Users/hoangkien/NLV/baking/frontend/src/components/Home/HomeNewCourses.jsx`

```jsx
import React, { useRef } from 'react';
import ProgramCard from '../Shared/ProgramCard';

const HomeNewCourses = ({ classes }) => {
  const carouselRef = useRef(null);

  // Sort by createdAt DESC, take first 8
  const newCourses = [...classes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  if (newCourses.length === 0) return null;

  return (
    <section className="ls s-py-40 s-py-lg-130 program program-carousel animate" data-animation="fadeInUp" id="new-courses">
      <div className="container">
        <div className="divider-25"></div>
        <div className="row">
          <div className="col-sm-12 text-center">
            <div className="section-heading">
              <h3>Khóa học mới</h3>
              <img className="image-wrap" src={`${import.meta.env.BASE_URL}images/icon-main.png`} alt="" />
            </div>
            <div className="d-none d-lg-block divider-60"></div>
            <div ref={carouselRef} className="owl-carousel carousel-nav" data-responsive-lg="3" data-responsive-md="2" data-responsive-sm="2" data-responsive-xs="1" data-nav="true" data-loop="true">
              {newCourses.map((cls) => (
                <ProgramCard key={cls.id} cls={cls} />
              ))}
            </div>
            <div className="divider-30 d-none d-xl-block"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeNewCourses;
```

### 6b. Sửa Home.jsx — Đổi thứ tự render

**File:** `/Users/hoangkien/NLV/baking/frontend/src/pages/Home.jsx`

**Find (lines 1-4):**
```
import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import HomeSlider from '../components/Home/HomeSlider';
import HomeClasses from '../components/Home/HomeClasses';
```
**Replace with:**
```
import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import HomeSlider from '../components/Home/HomeSlider';
import HomeClasses from '../components/Home/HomeClasses';
import HomeNewCourses from '../components/Home/HomeNewCourses';
```

**Find (lines 69-80, the return JSX):**
```
    return (
      <>
        <HomeSlider slides={data.upcomingSlides} />
        <HomeClasses classes={data.programs} />
        <HomeAbout />
        <TestimonialsSlider testimonials={data.testimonials} />
        {/* <HomeTimetables schedules={data.timetables} /> */}
        <HomeFaq />
        <HomeChiefs chiefs={data.chiefs} />
        <HomeContacts />
        <HomeBlog posts={data.posts} />
      </>
    );
```
**Replace with:**
```
    return (
      <>
        <HomeSlider slides={data.upcomingSlides} />
        <HomeClasses classes={data.programs} />
        <HomeNewCourses classes={data.programs} />
        <TestimonialsSlider testimonials={data.testimonials} />
        <HomeAbout />
      </>
    );
```

> Note: `HomeFaq`, `HomeChiefs`, `HomeContacts`, `HomeBlog` bị loại khỏi render nhưng import vẫn giữ nguyên (không gây lỗi, chỉ unused import).

---

## TASK 7: i18n — Đổi tiêu đề sections

### 7a. File vi.json

**File:** `/Users/hoangkien/NLV/baking/frontend/src/i18n/vi.json`

**Find (lines 27-30):**
```
    "classes": {
      "subtitle": "Khắp mọi nơi",
      "title": "Các lớp nấu ăn"
    },
```
**Replace with:**
```
    "classes": {
      "subtitle": "",
      "title": "Khóa học nổi bật"
    },
```

**Find (lines 31-36):**
```
    "about": {
      "watch": "Xem",
      "video": "Video",
      "subtitle": "thành tựu của chúng tôi",
      "title": "Xin chào, Chào mừng đến Muka!"
    },
```
**Replace with:**
```
    "about": {
      "watch": "Xem",
      "video": "Video",
      "subtitle": "",
      "title": "Giới thiệu về YUM Saigon"
    },
```

### 7b. File en.json

**File:** `/Users/hoangkien/NLV/baking/frontend/src/i18n/en.json`

**Find (lines 27-30):**
```
    "classes": {
      "subtitle": "Round the Globe",
      "title": "Our Cooking Classes"
    },
```
**Replace with:**
```
    "classes": {
      "subtitle": "",
      "title": "Featured Courses"
    },
```

**Find (lines 31-36):**
```
    "about": {
      "watch": "Watch",
      "video": "Video",
      "subtitle": "our achievements",
      "title": "Hello, Welcome to Muka!"
    },
```
**Replace with:**
```
    "about": {
      "watch": "Watch",
      "video": "Video",
      "subtitle": "",
      "title": "About YUM Saigon"
    },
```

---

## TASK 8: Header — Ẩn menu "Giảng viên"

**File:** `/Users/hoangkien/NLV/baking/frontend/src/components/Header/Header.jsx`

**Find (lines 37-39):**
```
                  <li className={location.pathname === "/chiefs" ? "active" : ""}>
                    <Link to={ROUTES.CHIEFS}>{t('header.instructors')}</Link>
                  </li>
```
**Replace with:**
```
                  {/* [HIDDEN] Ẩn menu Giảng viên theo yêu cầu khách hàng
                  <li className={location.pathname === "/chiefs" ? "active" : ""}>
                    <Link to={ROUTES.CHIEFS}>{t('header.instructors')}</Link>
                  </li>
                  */}
```

---

## TASK 9: ProgramDetail — Xóa instructor widget + cải thiện giá

**File:** `/Users/hoangkien/NLV/baking/frontend/src/pages/ProgramDetail.jsx`

### 9a. Thêm import formatStudentCount + calcDiscountPercent (line 7)

**Find:**
```
import { formatPrice } from '../utils/formatters';
```
**Replace with:**
```
import { formatPrice, formatStudentCount, calcDiscountPercent } from '../utils/formatters';
```

### 9b. Xóa instructor widget (lines 414-426)

**Find:**
```
              {(program.chief || program.authorImage) && (
                <div className="widget widget_instructor text-center p-4 mt-4 bordered">
                  <h4 className="widget-title">{t('programDetail.instructor') || 'Giảng Viên'}</h4>
                  <img src={imgSrc(program.chief?.image || program.authorImage)} alt={program.chief?.name || program.authorName} className="rounded-circle mb-3" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                  <h5>{program.chief?.name || program.authorName}</h5>
                  <p className="small-text color-main">{program.chief?.role || t('programDetail.masterChef') || 'Bếp Trưởng'}</p>
                  {program.chief && (
                    <div className="mt-3">
                      <Link to={ROUTES.CHIEF_DETAIL(program.chief.id)} className="btn btn-sm btn-outline-maincolor">{t('programDetail.viewProfile') || 'Xem Hồ Sơ'}</Link>
                    </div>
                  )}
                </div>
              )}
```
**Replace with:**
```
              {/* [HIDDEN] Instructor widget — ẩn theo yêu cầu khách hàng */}
```

### 9c. Cải thiện sidebar giá — thêm giá gốc + giá KM (line 400-401 area)

**Find:**
```
                <div className="mt-4">
                  {getCTAButton()}
```
**Replace with:**
```
                {/* Pricing display */}
                <div className="mt-3 mb-3 text-center">
                  {program.salePrice && program.price > program.salePrice ? (
                    <>
                      {calcDiscountPercent(program.price, program.salePrice) && (
                        <span className="discount-badge" style={{ position: 'static', display: 'inline-block', marginBottom: '8px' }}>
                          -{calcDiscountPercent(program.price, program.salePrice)}%
                        </span>
                      )}
                      <div>
                        <span className="price-original" style={{ fontSize: '16px' }}>{formatPrice(program.price)}</span>
                      </div>
                      <div>
                        <span className="price-sale" style={{ fontSize: '28px' }}>{formatPrice(program.salePrice)}</span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="price-sale" style={{ fontSize: '28px' }}>{formatPrice(program.price)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  {getCTAButton()}
```

---

## TASK 10: HomeSlider — Đổi fallback text author

**File:** `/Users/hoangkien/NLV/baking/frontend/src/components/Home/HomeSlider.jsx`

**Find (line 105):**
```
                            {slide.authorName || 'Lớp học sắp tới'}
```
**Replace with:**
```
                            {'Khóa học sắp tới'}
```

**Find (line 128):**
```
                            <a href="#chiefs" className="btn btn-light">{t('home.slider.ourFeedback')}</a>
```
**Replace with:**
```
                            <a href="#testimonials" className="btn btn-light">{t('home.slider.ourFeedback')}</a>
```

---

## TASK 11: HomeClasses — Ẩn subtitle khi rỗng

**File:** `/Users/hoangkien/NLV/baking/frontend/src/components/Home/HomeClasses.jsx`

**Find (line 17):**
```
						<h6 className="small-text color-main2">{t('home.classes.subtitle')}</h6>
```
**Replace with:**
```
						{t('home.classes.subtitle') && <h6 className="small-text color-main2">{t('home.classes.subtitle')}</h6>}
```

---

## Thứ tự thực thi khuyến nghị

1. **TASK 1** — Database schema (cần chạy command)
2. **TASK 3** — Utility helpers (không phụ thuộc gì)
3. **TASK 2** — Admin editor (phụ thuộc TASK 1)
4. **TASK 5** — CSS cho card mới (không phụ thuộc)
5. **TASK 4** — ProgramCard redesign (phụ thuộc TASK 3, 5)
6. **TASK 6a** — Tạo HomeNewCourses (phụ thuộc TASK 4)
7. **TASK 6b** — Sửa Home.jsx layout (phụ thuộc TASK 6a)
8. **TASK 7** — i18n labels
9. **TASK 8** — Header ẩn menu
10. **TASK 9** — ProgramDetail (phụ thuộc TASK 3)
11. **TASK 10** — HomeSlider cleanup
12. **TASK 11** — HomeClasses subtitle

## Verification

Sau khi hoàn thành tất cả tasks, restart cả backend và frontend rồi kiểm tra bằng browser:
1. Trang chủ: Thứ tự = Slider → Khóa học nổi bật → Khóa học mới → Cảm nhận → Giới thiệu YUM Saigon
2. Course card: Badge %, giá gạch, giá KM, nút MUA, KHÔNG có tên/ảnh người dạy
3. Header: KHÔNG có menu "Giảng viên"
4. Chi tiết khóa học: KHÔNG có widget instructor, giá hiển thị rõ ràng
5. Admin `/admin` → sửa 1 khóa học → thấy input "Giá khuyến mãi"
