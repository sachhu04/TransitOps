import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sendEmail } from '../../../lib/email';
import crypto from 'crypto';

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
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await prisma.invitation.findUnique({ where: { token: hashedToken } });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invite token' });
    }

    if (invitation.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: 'Invite token has expired. Please contact your administrator.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        password: hashedPassword,
      },
    });

    await prisma.invitation.delete({ where: { id: invitation.id } });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'TransitOps Account Activated',
      html: `
        <h1>Account Activated Successfully</h1>
        <p>Hi ${user.name},</p>
        <p>Your password has been successfully created and your TransitOps account is now active.</p>
        <p>If you did not perform this action, please contact your administrator immediately.</p>
      `,
    });

    return res.status(200).json({ message: 'Account setup successfully. You can now log in.' });
  } catch (error) {
    console.error('Setup account error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
