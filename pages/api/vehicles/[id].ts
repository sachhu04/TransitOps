import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    if (req.method === 'GET') {
      if (!['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST', 'ADMIN'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const vehicle = await prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        return res.status(200).json(vehicle);
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'PUT') {
      if (user.role !== 'FLEET_MANAGER' && user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const data = req.body;

        // Optional registration format validation if updating registration
        if (data.registration) {
          const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/i;
          if (!regRegex.test(data.registration.replace(/\s+/g, ''))) {
            return res.status(400).json({ message: 'Invalid Indian registration number format' });
          }

          // Check uniqueness if changing
          const existing = await prisma.vehicle.findUnique({
            where: { registration: data.registration },
          });
          if (existing && existing.id !== id) {
            return res.status(400).json({ message: 'Vehicle registration must be unique.' });
          }
        }

        const updatedVehicle = await prisma.vehicle.update({
          where: { id },
          data: {
            registration: data.registration,
            make: data.make,
            model: data.model,
            year: data.year ? Number(data.year) : undefined,
            type: data.type,
            status: data.status,
            mileage: data.mileage !== undefined ? Number(data.mileage) : undefined,
            capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
            acquisitionCost:
              data.acquisitionCost !== undefined ? Number(data.acquisitionCost) : undefined,
            region: data.region,
          },
        });
        return res.status(200).json(updatedVehicle);
      } catch (error) {
        console.error('Update vehicle error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'PATCH') {
      if (user.role !== 'FLEET_MANAGER' && user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        // Prevent archiving if it has active trips
        const activeTrips = await prisma.trip.findFirst({
          where: { vehicleId: id, status: { in: ['ASSIGNED', 'DISPATCHED'] } },
        });
        if (activeTrips) {
          return res.status(400).json({ message: 'Cannot archive vehicle with active trips' });
        }

        await prisma.vehicle.update({
          where: { id },
          data: { isArchived: true },
        });

        return res.status(200).json({ message: 'Vehicle archived successfully' });
      } catch (error) {
        console.error('Archive vehicle error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
