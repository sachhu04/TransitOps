import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method === 'GET') {
      try {
        const notes = await prisma.shiftNote.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        return res.status(200).json(notes);
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });

        const note = await prisma.shiftNote.create({
          data: {
            content,
            authorName: user.email.split('@')[0],
          },
        });
        return res.status(201).json(note);
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
