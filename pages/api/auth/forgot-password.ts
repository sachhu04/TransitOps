import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '../../../lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { email } = validation.data;

    // Rate Limiting Check
    const rateLimitCheck = await prisma.rateLimit.findFirst({
      where: {
        identifier: email,
        action: 'PASSWORD_RESET',
        createdAt: {
          gt: new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
        },
      },
    });

    if (rateLimitCheck) {
      // To prevent enumeration, still return 200, but don't process
      return res.status(200).json({
        message: 'If an account with that email exists, we have sent a password reset link to it.',
      });
    }

    // Record this attempt
    await prisma.rateLimit.create({
      data: {
        identifier: email,
        action: 'PASSWORD_RESET',
      },
    });

    const targetUser = await prisma.user.findUnique({ where: { email } });
    
    // We always return 200 to prevent User Enumeration, even if the user doesn't exist.
    if (!targetUser) {
      return res.status(200).json({ 
        message: 'If an account with that email exists, we have sent a password reset link to it.' 
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        resetToken: hashedToken,
        tokenExpiresAt,
      },
    });

    // Construct magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers.host}`;
    const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

    // Send email using Nodemailer
    const { success, error } = await sendEmail({
      to: email,
      subject: 'TransitOps Password Reset',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${targetUser.name},</p>
        <p>We received a request to reset your password for TransitOps.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy this link into your browser: <br/> ${resetLink}</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    if (!success) {
      console.error('Nodemailer error:', error);
      // We still return 200 to prevent enumeration, but log the error on the server
    }

    return res.status(200).json({
      message: 'If an account with that email exists, we have sent a password reset link to it.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
