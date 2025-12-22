import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendVerificationEmail = async (to, token) => {
  const verificationLink = `http://localhost:5173/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'DISMAT - Verify Your Email',
    html: `
      <h2>Welcome to DISMAT</h2>
      <p>Please click the link below to verify your email address. You will not be able to access the system until your email is verified.</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Email sending failed');
  }
};
export const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'DISMAT - Reset Your Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${to}`);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Email sending failed');
  }
};
