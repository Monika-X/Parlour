const nodemailer = require('nodemailer');

/**
 * ─────────────────────────────────────────────
 * EMAIL CONFIGURATION (PRODUCTION SAFE)
 * ─────────────────────────────────────────────
 */

const isProduction = process.env.NODE_ENV === 'production';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

let transporter = null;

// Only create transporter if credentials exist
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true only for port 465
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  console.log('Email service initialized (SMTP mode)');
} else {
  console.log('Email service running in CONSOLE MODE (no SMTP credentials)');
}

/**
 * ─────────────────────────────────────────────
 * MAIN DISPATCHER
 * ─────────────────────────────────────────────
 */
const sendNotification = async ({ to, subject, message, type = 'all' }) => {
  const tasks = [];

  if (!to) {
    console.warn('No recipient provided');
    return [];
  }

  // EMAIL
  if ((type === 'all' || type === 'email') && to.email) {
    tasks.push(sendEmail(to.email, subject, message));
  }

  // WHATSAPP (mock)
  if ((type === 'all' || type === 'whatsapp') && to.phone) {
    tasks.push(mockWhatsApp(to.phone, message));
  }

  // SMS (mock)
  if ((type === 'all' || type === 'sms') && to.phone) {
    tasks.push(mockSMS(to.phone, message));
  }

  return Promise.allSettled(tasks);
};

/**
 * ─────────────────────────────────────────────
 * REAL EMAIL SENDER (FIXED)
 * ─────────────────────────────────────────────
 */
const sendEmail = async (email, subject, text) => {
  try {
    if (!email) return { success: false, error: 'No email provided' };

    // 🔥 DEV MODE → Console fallback
    if (!transporter) {
      console.log(`
[EMAIL CONSOLE MODE]
To: ${email}
Subject: ${subject}
Message:
${text}
      `);

      return { success: true, mode: 'console' };
    }

    // 🔥 REAL EMAIL MODE
    const info = await transporter.sendMail({
      from: `"Parlour Salon & Spa" <${emailUser}>`,
      to: email,
      subject,
      text,
      html: `
        <div style="font-family:Arial;padding:20px;border:1px solid #eee">
          <h2 style="color:#c9a05a">Parlour Salon & Spa</h2>
          <p>${text.replace(/\n/g, '<br>')}</p>
          <hr/>
          <small>This is an automated email. Please do not reply.</small>
        </div>
      `,
    });

    console.log(`Email sent: ${email} (${info.messageId})`);

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * ─────────────────────────────────────────────
 * MOCK WHATSAPP
 * ─────────────────────────────────────────────
 */
const mockWhatsApp = async (phone, message) => {
  console.log(`[WHATSAPP MOCK] ${phone} → ${message}`);
  return { success: true, service: 'whatsapp' };
};

/**
 * ─────────────────────────────────────────────
 * MOCK SMS
 * ─────────────────────────────────────────────
 */
const mockSMS = async (phone, message) => {
  console.log(`[SMS MOCK] ${phone} → ${message}`);
  return { success: true, service: 'sms' };
};

module.exports = {
  transporter,
  sendNotification,
  sendEmail,
  mockWhatsApp,
  mockSMS,
};