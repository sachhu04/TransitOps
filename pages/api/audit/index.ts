import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line unused-imports/no-unused-vars
  return requireAuth(async (req, res, user) => {
    if (req.method === 'GET') {
      try {
        const logs = await prisma.activityLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        return res.status(200).json(logs);
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
