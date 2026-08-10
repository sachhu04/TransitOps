import { sendEmail } from './lib/email';
import * as dotenv from 'dotenv';
dotenv.config();

sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Test</p>',
})
  .then((res: any) => {
    console.log('Result:', res);
  })
  .catch((err: any) => {
    console.error('Error:', err);
  });
