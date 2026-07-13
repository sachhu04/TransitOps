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
      if (!['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const vehicle = await prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        return res.status(200).json(vehicle);
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'PUT') {
      if (user.role !== 'FLEET_MANAGER') {
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
          const existing = await prisma.vehicle.findUnique({ where: { registration: data.registration } });
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
            acquisitionCost: data.acquisitionCost !== undefined ? Number(data.acquisitionCost) : undefined,
            region: data.region,
          }
        });
        return res.status(200).json(updatedVehicle);
      } catch (error) {
        console.error('Update vehicle error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'DELETE') {
      if (user.role !== 'FLEET_MANAGER') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        // Prevent deleting if it has active trips (optional safety measure, but let's try to delete safely)
        const activeTrips = await prisma.trip.findFirst({
          where: { vehicleId: id, status: { in: ['ASSIGNED', 'DISPATCHED'] } }
        });
        if (activeTrips) {
          return res.status(400).json({ message: 'Cannot delete vehicle with active trips' });
        }
        
        // Due to referential integrity, delete related first or use CASCADE.
        // Assuming no cascade in schema, we'll manually delete trips, maintenance, and fuel logs.
        await prisma.trip.deleteMany({ where: { vehicleId: id } });
        await prisma.maintenanceLog.deleteMany({ where: { vehicleId: id } });
        await prisma.fuelLog.deleteMany({ where: { vehicleId: id } });
        
        await prisma.vehicle.delete({ where: { id } });
        
        return res.status(200).json({ message: 'Vehicle deleted successfully' });
      } catch (error) {
        console.error('Delete vehicle error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
