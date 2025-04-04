module.exports = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.MAIL_USER || 'your-email@gmail.com',
    pass: process.env.MAIL_PASSWORD || 'your-email-password-or-app-password'
  },
  from: process.env.MAIL_FROM || 'SIGAP Application <your-email@gmail.com>'
}
