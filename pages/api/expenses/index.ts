import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method === 'GET') {
      if (!['FINANCIAL_ANALYST'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const expenses = await prisma.expense.findMany({
          include: { vehicle: true, trip: true },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(expenses);
      } catch (error: unknown) {
        if (error instanceof Error) {
          return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      if (!['FINANCIAL_ANALYST'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const data = req.body;
        const newExpense = await prisma.expense.create({
          data: {
            vehicleId: data.vehicleId || null,
            tripId: data.tripId || null,
            type: data.type,
            amount: Number(data.amount),
            date: new Date(data.date),
            notes: data.notes || null,
          }
        });
        return res.status(201).json(newExpense);
      } catch (error: any) {
        console.error('Expense error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
