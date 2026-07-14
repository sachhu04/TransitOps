import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';
import crypto from 'crypto';

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

      return res.status(201).json({
        message: 'User invited successfully',
        inviteLink,
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
