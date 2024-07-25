const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const sendVerificationEmail = async (user) => {
  try {
    // Generate JWT token
    

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification',
      html: `<p>Please verify your email by clicking the link:</p><br />
       <a href='https://savage-blog-back.vercel.app/api/verify/email/${user._id}'>verify here</a>`
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

module.exports = sendVerificationEmail;
