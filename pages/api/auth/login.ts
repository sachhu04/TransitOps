import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password, role, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isArchived) {
      return res.status(401).json({ message: 'Account has been deactivated' });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: 'Selected role does not match assigned role' });
    }

    if (!user.password) {
      return res
        .status(401)
        .json({ message: 'Account not set up. Please use your invite link to create a password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const expiresIn = rememberMe ? '30d' : '1d';
    const maxAge = rememberMe ? 2592000 : 86400; // 30 days or 1 day in seconds

    const token = generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      expiresIn
    );

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
