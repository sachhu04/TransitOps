import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

async function test() {
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test OAuth2',
      html: '<p>Testing OAuth2</p>',
    });
    console.log('Success:', info);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
