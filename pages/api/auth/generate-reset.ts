import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '../../../lib/email';

const generateResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can generate reset links' });
    }

    try {
      const validation = generateResetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.issues[0].message });
      }

      const { email } = validation.data;

      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          resetToken,
          tokenExpiresAt,
        },
      });

      // Construct magic link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers.host}`;
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      // Send email
      const { success, error } = await sendEmail({
        to: email,
        subject: 'TransitOps Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${targetUser.name},</p>
          <p>Your administrator has generated a password reset link for your account.</p>
          <p>Please click the link below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or copy this link into your browser: <br/> ${resetLink}</p>
        `,
      });

      if (!success) {
        console.error('Nodemailer error:', error);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }

      return res.status(200).json({
        message: 'Reset link generated and emailed successfully',
      });
    } catch (error) {
      console.error('Reset generation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
