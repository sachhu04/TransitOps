import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const setupSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const validation = setupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { token, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { inviteToken: token } });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired invite token' });
    }

    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite token has expired. Please contact your administrator.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        tokenExpiresAt: null,
      },
    });

    return res.status(200).json({ message: 'Account setup successfully. You can now log in.' });
  } catch (error) {
    console.error('Setup account error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
