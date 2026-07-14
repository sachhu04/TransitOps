import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can manage users' });
    }

    if (req.method === 'GET') {
      try {
        const users = await prisma.user.findMany({
          where: { isArchived: false },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        // Also fetch pending invitations to show them in the UI if needed
        const invitations = await prisma.invitation.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            expiresAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ users, invitations });
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }

    if (req.method === 'DELETE') {
      try {
        const { id } = req.body;
        
        if (!id) {
          return res.status(400).json({ message: 'User ID is required' });
        }

        if (id === user.id) {
          return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
          return res.status(404).json({ message: 'User not found' });
        }

        await prisma.user.delete({
          where: { id },
        });

        return res.status(200).json({ message: 'User successfully deleted' });
      } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  })(req, res);
}
