const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  senderEmail: process.env.SENDER_EMAIL || 'noreply@yourapplication.com',
  senderName: process.env.SENDER_NAME || 'Your Application'
};

export default emailConfig;
