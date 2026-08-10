import { sendEmail } from './TransitOps/lib/email';
import * as dotenv from 'dotenv';
dotenv.config();

sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Test</p>',
})
  .then((res) => {
    console.log('Result:', res);
  })
  .catch((err) => {
    console.error('Error:', err);
  });
