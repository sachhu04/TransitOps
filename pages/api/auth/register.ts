import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

      const inviteToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role,
          inviteToken,
          tokenExpiresAt,
        },
      });

      // Construct magic link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers.host}`;
      const inviteLink = `${baseUrl}/setup-account?token=${inviteToken}`;

      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: 'TransitOps <onboarding@resend.dev>',
        to: [email],
        subject: 'You have been invited to TransitOps',
        html: `
          <h1>Welcome to TransitOps!</h1>
          <p>You have been invited by the Admin to join as a <strong>${role}</strong>.</p>
          <p>Please click the link below to set up your account and password:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Set up your account</a>
          <p>Or copy this link into your browser: <br/> ${inviteLink}</p>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return res.status(500).json({ message: 'Failed to send invitation email' });
      }

      return res.status(201).json({
        message: 'User invited successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
