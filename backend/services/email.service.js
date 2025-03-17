
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
      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    }
    
    return { messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333;">Verify Your Email</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">Hi ${user.fullName},</p>
        <p style="margin-bottom: 15px;">Thank you for registering with EasyHR. Please verify your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="margin-bottom: 15px;">If the button doesn't work, you can also click on the link below or copy it to your browser:</p>
        <p style="margin-bottom: 15px; word-break: break-all;"><a href="${verificationUrl}" style="color: #8B5CF6;">${verificationUrl}</a></p>
        <p style="margin-bottom: 15px;">This link will expire in <strong>24 hours</strong>.</p>
        <p style="margin-bottom: 5px;">If you did not create an account, please ignore this email.</p>
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9e9e9; text-align: center; color: #777; font-size: 12px;">
        <p>© ${new Date().getFullYear()} EasyHR. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail(user.email, 'Verify Your Email - EasyHR', html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail
};
