
const nodemailer = require('nodemailer');

// Create a test account if no email service is configured
let transporter;

const initTransporter = async () => {
  // If in production, use configured SMTP settings
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Create a test account for development
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test email account created:', testAccount);
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

// Initialize transporter
initTransporter();

const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      await initTransporter();
    }
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"EasyHR" <noreply@easyhr.com>',
      to,
      subject,
      html
    });
    
    console.log('Email sent: %s', info.messageId);
    
    // Preview URL for test accounts
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <h1>Verify Your Email</h1>
    <p>Hi ${user.fullName},</p>
    <p>Thank you for registering with EasyHR. Please verify your email by clicking the link below:</p>
    <p><a href="${verificationUrl}">Verify Email</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
  `;
  
  return sendEmail(user.email, 'Verify Your Email - EasyHR', html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail
};
