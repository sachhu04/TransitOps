import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const info = await emailTransporter.sendMail({
      from: `"TransitOps Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, info };
  } catch (error) {
    console.error('Nodemailer error:', error);
    return { success: false, error };
  }
};
