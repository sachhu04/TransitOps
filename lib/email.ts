import { send } from '@emailjs/nodejs';

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
    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error('EmailJS is not configured properly in environment variables.');
    }

    const templateParams = {
      to_email: to,
      subject: subject,
      message: html,
    };

    const info = await send(SERVICE_ID, TEMPLATE_ID, templateParams, {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY,
    });
    return { success: true, info };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error };
  }
};
