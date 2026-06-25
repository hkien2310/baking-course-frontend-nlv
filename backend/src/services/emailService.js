const nodemailer = require('nodemailer');

/**
 * Gửi email sử dụng cấu hình SMTP từ biến môi trường.
 * Nếu không cấu hình SMTP_USER và SMTP_PASS, service sẽ tự động khởi tạo Ethereal Mail để giả lập và log URL xem trước.
 * 
 * @param {Object} options
 * @param {string} options.to - Địa chỉ email người nhận
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.html - Nội dung email định dạng HTML
 */
const sendEmail = async ({ to, subject, html }) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || '"YumSaigon" <no-reply@bakingcourse.com>';

  // Nếu không có thông tin xác thực SMTP (User/Pass)
  if (!user || !pass) {
    console.log('SMTP_USER hoặc SMTP_PASS chưa được cấu hình.');
    console.log('Đang khởi tạo tài khoản Ethereal Mail giả lập để gửi thử nghiệm...');
    try {
      // Tạo tài khoản test Ethereal
      const testAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // Ethereal dùng STARTTLS
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: '"YumSaigon" <no-reply@bakingcourse.com>',
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log('========================================================================');
      console.log(`[ETHEREAL MAIL MOCK SENT]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview URL: ${previewUrl}`);
      console.log('========================================================================');

      return { success: true, previewUrl, messageId: info.messageId };
    } catch (err) {
      console.error('Không thể gửi email giả lập qua Ethereal Mail:', err);
      // Fallback ghi log ra console thông thường nếu Ethereal API lỗi
      console.log('------------------------------------------------------------------------');
      console.log(`[MOCK EMAIL LOG]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${html}`);
      console.log('------------------------------------------------------------------------');
      return { success: true, mock: true };
    }
  }

  // Nếu đã cấu hình SMTP đầy đủ
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true nếu dùng SSL cổng 465
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email đã được gửi thành công: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
};

module.exports = { sendEmail };
