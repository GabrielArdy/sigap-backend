const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth
});

/**
 * Send an email
 * @param {Object} mailOptions - Email options
 * @returns {Promise} - Promise representing the sending result
 */
const sendMail = async (mailOptions) => {
  try {
    const defaultMailOptions = {
      from: emailConfig.from
    };
    
    const info = await transporter.sendMail({
      ...defaultMailOptions,
      ...mailOptions
    });
    
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise} - Result of sending email
 */
const sendNotification = (to, subject, message) => {
  return sendMail({
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>${subject}</h2>
        <div>${message}</div>
        <p style="margin-top: 20px; color: #777; font-size: 12px;">
          This is an automated message from SIGAP Application. Please do not reply to this email.
        </p>
      </div>
    `
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Reset URL base
 * @returns {Promise} - Result of sending email
 */
const sendPasswordReset = (to, resetToken, resetUrl) => {
  const resetLink = `${resetUrl}?token=${resetToken}`;
  
  return sendMail({
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset</h2>
        <p>You have requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="margin-top: 20px; color: #777; font-size: 12px;">
          This is an automated message from SIGAP Application. Please do not reply to this email.
        </p>
      </div>
    `
  });
};

// Export functions
module.exports = {
  sendMail,
  sendNotification,
  sendPasswordReset
};
