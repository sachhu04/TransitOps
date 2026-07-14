import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '../../../lib/email';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can invite users' });
    }

    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.issues[0].message });
      }

      const { name, email, role } = validation.data;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await prisma.invitation.upsert({
        where: { email },
        update: {
          name,
          role,
          token: hashedToken,
          expiresAt,
          invitedBy: user.id,
        },
        create: {
          email,
          name,
          role,
          token: hashedToken,
          expiresAt,
          invitedBy: user.id,
        },
      });

      // Construct magic link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers.host}`;
      const inviteLink = `${baseUrl}/setup-account?token=${rawToken}`;

      // Send email
      const { success, error } = await sendEmail({
        to: email,
        subject: 'Welcome to TransitOps - Account Invitation',
        html: `
          <h1>Welcome to TransitOps</h1>
          <p>Hi ${name},</p>
          <p>You have been invited to join TransitOps as a <strong>${role}</strong>.</p>
          <p>Please click the link below to set up your password and access your account:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Set Up Account</a>
          <p>Or copy this link into your browser: <br/> ${inviteLink}</p>
        `,
      });

      if (!success) {
        console.error('Nodemailer error:', error);
        return res.status(500).json({ message: 'Failed to send invitation email' });
      }

      return res.status(201).json({
        message: 'User invited successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
