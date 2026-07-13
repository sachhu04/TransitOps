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
        const logs = await prisma.fuelLog.findMany({
          include: { vehicle: true },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(logs);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    } else if (req.method === 'POST') {
      if (!['FINANCIAL_ANALYST'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const data = req.body;

        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        const newLog = await prisma.fuelLog.create({
          data: {
            vehicleId: data.vehicleId,
            date: new Date(data.date),
            liters: Number(data.liters),
            cost: Number(data.cost),
            location: data.location,
          }
        });

        return res.status(201).json(newLog);
      } catch (error: any) {
        console.error('Fuel error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
