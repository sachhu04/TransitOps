import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method === 'GET') {
      if (!['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const vehicles = await prisma.vehicle.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(vehicles);
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      if (user.role !== 'FLEET_MANAGER') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const data = req.body;
        // Validate registration format (Indian)
        const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/i;
        if (!regRegex.test(data.registration.replace(/\s+/g, ''))) {
          return res.status(400).json({ message: 'Invalid Indian registration number format' });
        }

        const existing = await prisma.vehicle.findUnique({ where: { registration: data.registration } });
        if (existing) {
          return res.status(400).json({ message: 'Vehicle registration must be unique.' });
        }
        
        const newVehicle = await prisma.vehicle.create({
          data: {
            registration: data.registration,
            make: data.make,
            model: data.model,
            year: Number(data.year),
            type: data.type,
            status: data.status || 'AVAILABLE',
            mileage: Number(data.mileage || 0),
            healthScore: Number(data.healthScore || 100),
            capacity: Number(data.capacity || 0),
            acquisitionCost: Number(data.acquisitionCost || 0),
            region: data.region || 'Maharashtra',
          }
        });
        return res.status(201).json(newVehicle);
      } catch (error: any) {
        console.error('Vehicle creation error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
