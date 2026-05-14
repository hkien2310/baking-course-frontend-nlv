import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import { ROUTES } from '../constants/routes';
import { useSiteConfig } from '../context/SiteConfigContext';

const SECTIONS = [
  { id: 'privacy', title: 'Chính sách bảo mật', icon: 'fa-shield' },
  { id: 'terms', title: 'Điều khoản sử dụng', icon: 'fa-file-text-o' },
  { id: 'payment', title: 'Chính sách giao dịch chung', icon: 'fa-credit-card' },
  { id: 'refund', title: 'Chính sách đổi trả / Hoàn tiền', icon: 'fa-exchange' },
  { id: 'delivery', title: 'Chính sách cung cấp dịch vụ', icon: 'fa-truck' },
];

const Policies = () => {
  const { siteConfig } = useSiteConfig();
  const location = useLocation();
  const companyName = siteConfig?.name || 'YUM Saigon';
  const email = siteConfig?.contact?.email || 'yumsaigon2020@gmail.com';
  const phone = siteConfig?.contact?.phone || '0938561989';
  const address = siteConfig?.contact?.address || '114B Hoàng Hoa Thám Phường Bảy Hiền TP Hồ Chí Minh';
  const website = siteConfig?.contact?.website || 'www.hoclambanhkhongkho.com';
  const domain = website.replace('www.', '').replace('https://', '').replace('http://', '');

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      }
    }
  }, [location.hash]);

  return (
    <>
      <PageTitle
        title="Chính Sách & Điều Khoản"
        breadcrumbs={[
          { label: 'Trang chủ', link: ROUTES.HOME },
          { label: 'Chính sách & Điều khoản' }
        ]}
      />

      <section className="ls s-pt-50 s-pb-80 s-pt-lg-75 s-pb-lg-100" style={{ overflow: 'visible' }}>
        <div className="container" style={{ overflow: 'visible' }}>
          <div className="row" style={{ overflow: 'visible' }}>
            {/* Sidebar Navigation */}
            <div className="col-lg-3 d-none d-lg-block" style={{ alignSelf: 'flex-start', position: 'sticky', top: '120px', zIndex: 10 }}>
              <div style={{
                background: '#fff', borderRadius: '12px',
                border: '1px solid #eee', padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                <h6 style={{ color: '#c19a5b', fontWeight: 700, marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mục lục
                </h6>
                <nav>
                  {SECTIONS.map(s => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={e => {
                        e.preventDefault();
                        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                        color: '#333', textDecoration: 'none', fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fff8f0'; e.currentTarget.style.color = '#c19a5b'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#333'; }}
                    >
                      <i className={`fa ${s.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-9">
              <div style={{ maxWidth: '800px' }}>

                {/* 1. Chính sách bảo mật */}
                <article id="privacy" style={{ marginBottom: '50px', scrollMarginTop: '90px' }}>
                  <h3 style={{ color: '#c19a5b', borderBottom: '2px solid #c19a5b', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa fa-shield mr-2"></i>Chính Sách Bảo Mật
                  </h3>
                  
                  <h5>1. Mục đích và phạm vi thu thập</h5>
                  <ul>
                    <li>Việc thu thập dữ liệu trên website bao gồm: họ tên, email, điện thoại, địa chỉ khách hàng. Đây là các thông tin mà chúng tôi cần khách hàng cung cấp bắt buộc khi gửi thông tin nhờ tư vấn hay muốn mua khóa học và để chúng tôi liên hệ xác nhận lại với khách hàng trên website nhằm đảm bảo quyền lợi cho người tiêu dùng.</li>
                    <li>Các khách hàng sẽ tự chịu trách nhiệm về bảo mật và lưu giữ mọi hoạt động sử dụng dịch vụ dưới thông tin mà mình cung cấp và hộp thư điện tử của mình.</li>
                  </ul>

                  <h5>2. Phạm vi sử dụng thông tin</h5>
                  <p>Chúng tôi sử dụng thông tin khách hàng cung cấp để:</p>
                  <ul>
                    <li>Liên hệ xác nhận đơn hàng và kích hoạt khóa học cho khách hàng;</li>
                    <li>Cung cấp thông tin về khóa học đến khách hàng nếu có yêu cầu;</li>
                    <li>Gửi email tiếp thị, khuyến mại về các khóa học do chúng tôi cung cấp;</li>
                    <li>Gửi các thông báo về các hoạt động trên website {domain};</li>
                    <li>Liên lạc và giải quyết với người dùng trong những trường hợp đặc biệt;</li>
                    <li>Không sử dụng thông tin cá nhân của người dùng ngoài mục đích xác nhận và liên hệ có liên quan đến giao dịch;</li>
                    <li>Khi có yêu cầu của cơ quan tư pháp bao gồm: Viện kiểm sát, tòa án, cơ quan công an điều tra liên quan đến hành vi vi phạm pháp luật nào đó của khách hàng.</li>
                  </ul>

                  <h5>3. Thời gian lưu trữ thông tin</h5>
                  <ul>
                    <li>Dữ liệu cá nhân của khách hàng sẽ được lưu trữ cho đến khi có yêu cầu ban quản trị hủy bỏ.</li>
                    <li>Còn lại trong mọi trường hợp thông tin cá nhân khách hàng sẽ được bảo mật trên máy chủ của chúng tôi.</li>
                  </ul>

                  <h5>4. Những người hoặc tổ chức có thể tiếp cận với thông tin cá nhân</h5>
                  <ul>
                    <li>Ban quản trị website.</li>
                    <li>Khách hàng sở hữu thông tin cá nhân đó.</li>
                    <li>Các cơ quan Pháp luật Việt Nam có thẩm quyền.</li>
                    <li>Các đối tác hoạt động liên quan đến giao dịch của bạn, chẳng hạn như cổng thanh toán VNPay.</li>
                  </ul>

                  <h5>5. Phương tiện và công cụ để người dùng tiếp cận và chỉnh sửa dữ liệu</h5>
                  <ul>
                    <li>Khách hàng có quyền tự kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bằng cách liên hệ với ban quản trị website.</li>
                    <li>Khách hàng có quyền gửi khiếu nại về nội dung bảo mật thông tin đề nghị liên hệ Ban quản trị của website. Khi tiếp nhận những phản hồi này, chúng tôi sẽ xác nhận lại thông tin và có những biện pháp xử lý kịp thời.</li>
                  </ul>
                </article>

                {/* 2. Điều khoản sử dụng */}
                <article id="terms" style={{ marginBottom: '50px', scrollMarginTop: '90px' }}>
                  <h3 style={{ color: '#c19a5b', borderBottom: '2px solid #c19a5b', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa fa-file-text-o mr-2"></i>Điều Khoản Sử Dụng
                  </h3>
                  <p>Điều khoản sử dụng quy định quyền và nghĩa vụ của người học khi truy cập và sử dụng dịch vụ, khóa học tại <strong>{domain}</strong>. Khi đăng ký hoặc sử dụng khóa học, bạn được hiểu là đã đọc, hiểu và đồng ý với toàn bộ điều khoản dưới đây.</p>

                  <h5>1. Phạm vi áp dụng</h5>
                  <ul>
                    <li>Người dùng truy cập website {domain}.</li>
                    <li>Học viên đăng ký và tham gia các khóa học online.</li>
                    <li>Các dịch vụ, sản phẩm số được cung cấp trên hệ thống.</li>
                  </ul>

                  <h5>2. Quyền và nghĩa vụ của học viên</h5>
                  <p><strong>Quyền của học viên:</strong></p>
                  <ul>
                    <li>Truy cập và học tập toàn bộ nội dung khóa học đã đăng ký trong thời hạn quy định.</li>
                    <li>Được hỗ trợ kỹ thuật trong suốt quá trình học.</li>
                    <li>Được bảo mật thông tin cá nhân theo chính sách của {domain}.</li>
                  </ul>
                  <p><strong>Nghĩa vụ của học viên cam kết:</strong></p>
                  <ul>
                    <li>Cung cấp thông tin chính xác khi đăng ký tài khoản.</li>
                    <li>Giữ bí mật tài khoản, mật khẩu; tự chịu trách nhiệm nếu để lộ hoặc chia sẻ thông tin cho người khác.</li>
                    <li>Không sao chép, quay màn hình, chia sẻ, phát tán, bán lại khóa học dưới bất kỳ hình thức nào.</li>
                    <li>Không sử dụng khóa học vào mục đích thương mại trái phép.</li>
                  </ul>

                  <h5>3. Quyền và trách nhiệm của {domain}</h5>
                  <ul>
                    <li><strong>Quyền:</strong> Cập nhật nội dung khóa học để đảm bảo chất lượng. Tạm khóa tài khoản nếu phát hiện hành vi vi phạm bản quyền, gian lận hoặc chia sẻ trái phép. Từ chối hỗ trợ đối với các trường hợp cố tình lạm dụng dịch vụ.</li>
                    <li><strong>Trách nhiệm:</strong> Cung cấp khóa học đúng mô tả. Đảm bảo hệ thống hoạt động ổn định (ngoại trừ các sự cố bất khả kháng). Hỗ trợ học viên trong quá trình truy cập và học tập.</li>
                  </ul>

                  <h5>4. Chính sách bản quyền</h5>
                  <ul>
                    <li>Tất cả nội dung trên {domain} (video, bài giảng, tài liệu, hình ảnh) thuộc sở hữu của {companyName} hoặc đối tác được ủy quyền.</li>
                    <li>Nghiêm cấm mọi hình thức sao chép, tái bản, buôn bán, chia sẻ trái phép.</li>
                    <li>Vi phạm bản quyền sẽ bị khóa tài khoản không hoàn tiền và có thể bị xử lý theo quy định pháp luật.</li>
                  </ul>

                  <h5>5. Giới hạn trách nhiệm</h5>
                  <p>{companyName} không chịu trách nhiệm đối với:</p>
                  <ul>
                    <li>Thiệt hại do lỗi chủ quan từ phía người học (lộ mật khẩu, tự xoá tài khoản).</li>
                    <li>Lỗi đường truyền internet, thiết bị của học viên hoặc các yếu tố ngoài khả năng kiểm soát.</li>
                  </ul>
                </article>

                {/* 3. Chính sách giao dịch chung */}
                <article id="payment" style={{ marginBottom: '50px', scrollMarginTop: '90px' }}>
                  <h3 style={{ color: '#c19a5b', borderBottom: '2px solid #c19a5b', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa fa-credit-card mr-2"></i>Chính Sách Giao Dịch Chung
                  </h3>
                  <p>Chính sách giao dịch chung quy định nguyên tắc, quy trình và điều kiện khi học viên thực hiện giao dịch mua khóa học tại <strong>{domain}</strong>.</p>

                  <h5>1. Nguyên tắc giao dịch</h5>
                  <ul>
                    <li>{domain} hoạt động theo mô hình cung cấp khóa học online dưới dạng sản phẩm số.</li>
                    <li>Mọi giao dịch giữa học viên và {domain} đều thực hiện trên môi trường trực tuyến thông qua cổng thanh toán VNPay.</li>
                    <li>Giao dịch chỉ được xem là hoàn tất khi hệ thống xác nhận thanh toán thành công và tài khoản học được tự động kích hoạt.</li>
                  </ul>

                  <h5>2. Quy trình đặt mua và thanh toán</h5>
                  <ul>
                    <li><strong>Bước 1: Chọn khóa học.</strong> Học viên xem thông tin khóa học, chương trình học, mức phí.</li>
                    <li><strong>Bước 2: Đăng ký thông tin.</strong> Học viên cung cấp họ tên, email, số điện thoại để tạo tài khoản hoặc đăng nhập.</li>
                    <li><strong>Bước 3: Thanh toán qua VNPay.</strong> Học viên thanh toán 100% bằng cách quét mã QR hoặc nhập thẻ ATM nội địa / thẻ quốc tế trên cổng VNPay.</li>
                    <li><strong>Bước 4: Xác nhận.</strong> Sau khi VNPay báo thành công, {domain} sẽ kích hoạt khóa học ngay lập tức và gửi email xác nhận.</li>
                  </ul>

                  <h5>3. Quy định về bảo mật giao dịch</h5>
                  <ul>
                    <li>Học viên phải giữ bí mật thông tin tài khoản giao dịch.</li>
                    <li>Mọi thông tin thanh toán (như số thẻ ngân hàng) được xử lý trực tiếp bởi cổng thanh toán VNPay. {domain} không lưu trữ thông tin thẻ của khách hàng, đảm bảo an toàn tuyệt đối theo chuẩn quốc tế.</li>
                  </ul>
                </article>

                {/* 4. Chính sách đổi trả / Hoàn tiền */}
                <article id="refund" style={{ marginBottom: '50px', scrollMarginTop: '90px' }}>
                  <h3 style={{ color: '#c19a5b', borderBottom: '2px solid #c19a5b', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa fa-exchange mr-2"></i>Chính Sách Đổi Trả / Hoàn Tiền
                  </h3>
                  
                  <h5>1. Quy định chung</h5>
                  <ul>
                    <li>Do khóa học là <strong>sản phẩm số (digital content)</strong> và được kích hoạt ngay sau khi thanh toán thành công, {domain} <strong>không áp dụng chính sách đổi trả hoặc hoàn tiền</strong> dưới mọi hình thức vì lý do thay đổi ý định của học viên.</li>
                  </ul>

                  <h5>2. Các trường hợp ngoại lệ (Lỗi kỹ thuật)</h5>
                  <p>Chúng tôi chỉ xem xét hoàn tiền hoặc cấp lại quyền truy cập trong các trường hợp sau:</p>
                  <ul>
                    <li>Khách hàng đã thanh toán thành công qua VNPay (tài khoản đã bị trừ tiền) nhưng do lỗi hệ thống nên không truy cập được khóa học trong vòng 24 giờ.</li>
                    <li>Khóa học bị lỗi kỹ thuật hệ thống từ phía {domain} khiến học viên không thể xem được video liên tục.</li>
                    <li>Nội dung khóa học thực tế hoàn toàn sai lệch so với mô tả ban đầu.</li>
                  </ul>
                  <p>→ Khi gặp các sự cố trên, {domain} sẽ ưu tiên khắc phục lỗi kỹ thuật, hoặc đổi sang khóa học khác tương đương. Nếu không thể khắc phục, chúng tôi sẽ tiến hành hoàn tiền vào đúng tài khoản ngân hàng / thẻ mà học viên đã sử dụng để thanh toán.</p>
                </article>

                {/* 5. Chính sách cung cấp dịch vụ (Giao nhận) */}
                <article id="delivery" style={{ marginBottom: '30px', scrollMarginTop: '90px' }}>
                  <h3 style={{ color: '#c19a5b', borderBottom: '2px solid #c19a5b', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa fa-truck mr-2"></i>Chính Sách Cung Cấp Dịch Vụ
                  </h3>

                  <h5>1. Phương thức cung cấp (giao nhận)</h5>
                  <ul>
                    <li>Nội dung khóa học được cung cấp 100% trực tuyến (online), không có hình thức giao nhận hàng hóa vật lý (không ship COD tài liệu hay USB).</li>
                    <li>Sau khi giao dịch hoàn tất, học viên sẽ được cấp quyền truy cập để xem video bài giảng trực tiếp trên website {domain}.</li>
                  </ul>

                  <h5>2. Thời gian cung cấp dịch vụ</h5>
                  <ul>
                    <li>Thời gian kích hoạt: Kích hoạt <strong>tự động ngay lập tức</strong> (hoặc chậm nhất từ 5–30 phút) kể từ khi hệ thống nhận được thông báo thanh toán thành công từ cổng VNPay.</li>
                    <li>Thời hạn sử dụng khóa học: Phụ thuộc vào gói khóa học mà học viên đã mua (thông thường là truy cập trọn đời hoặc theo thời hạn được niêm yết cụ thể trên trang thông tin khóa học).</li>
                  </ul>
                  
                  <p>Nếu quá thời gian nêu trên mà tài khoản chưa được kích hoạt, học viên vui lòng gửi email hoặc gọi Hotline kèm theo mã giao dịch VNPay để được hỗ trợ kiểm tra và xử lý ngay lập tức.</p>
                </article>

                {/* Company Info Footer */}
                <div style={{
                  marginTop: '40px', padding: '25px',
                  background: '#faf6f0', borderRadius: '12px',
                  border: '1px solid #e8dcc8'
                }}>
                  <h6 style={{ color: '#c19a5b', marginBottom: '12px' }}>
                    <i className="fa fa-building-o mr-2"></i>Địa chỉ của đơn vị thu thập và quản lý thông tin
                  </h6>
                  <p style={{ margin: 0, lineHeight: 1.8, fontSize: '14px', color: '#555' }}>
                    <strong>{companyName}</strong><br />
                    Địa chỉ: {address}<br />
                    Điện thoại hỗ trợ / khiếu nại: {phone}<br />
                    Email: {email}<br />
                    Website: {domain}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Policies;
