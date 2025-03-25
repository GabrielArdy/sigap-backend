import nodemailer from 'nodemailer';
import emailConfig from '../config/email.config.js';

// Create transporter outside functions so it can be reused
const transporter = nodemailer.createTransport({
  host: emailConfig.host || 'smtp.gmail.com',
  port: emailConfig.port || 587,
  secure: emailConfig.secure || false,
  auth: {
    user: emailConfig.user || process.env.EMAIL_USER,
    pass: emailConfig.password || process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send a generic email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @returns {Promise} - Promise resolving to email send result
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: emailConfig.senderEmail || process.env.SENDER_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email to new users
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise} - Promise resolving to email send result
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Selamat Datang di Aplikasi Kami!';
  const text = `Halo ${name}, Terima kasih telah bergabung dengan aplikasi kami.`;
  const html = `
    <div>
      <h1>Selamat Datang, ${name}!</h1>
      <p>Terima kasih telah bergabung dengan aplikasi kami.</p>
      <p>Mulai jelajahi fitur-fitur kami sekarang!</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Base URL for reset
 * @returns {Promise} - Promise resolving to email send result
 */
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const resetLink = `${resetUrl}?token=${resetToken}`;
  const subject = 'Reset Password';
  const text = `Untuk reset password Anda, silakan klik link berikut: ${resetLink}. Link ini berlaku selama 1 jam.`;
  const html = `
    <div>
      <h1>Reset Password</h1>
      <p>Anda telah meminta untuk reset password.</p>
      <p>Klik link berikut untuk melanjutkan:</p>
      <a href="${resetLink}" style="padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Link ini hanya berlaku selama 1 jam.</p>
      <p>Jika Anda tidak meminta reset password, silakan abaikan email ini.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send notification email
 * @param {string} email - User email
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @returns {Promise} - Promise resolving to email send result
 */
const sendNotificationEmail = async (email, subject, message) => {
  const text = message;
  const html = `<div><h2>${subject}</h2><p>${message}</p></div>`;

  return sendEmail({ to: email, subject, text, html });
};

export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail
};
