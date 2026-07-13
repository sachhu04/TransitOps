import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method === 'GET') {
      if (!['DISPATCHER', 'SAFETY_OFFICER', 'FLEET_MANAGER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const trips = await prisma.trip.findMany({
          include: {
            vehicle: true,
            driver: true
          },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(trips);
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      if (!['DISPATCHER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const data = req.body;
        
        // Validation rules for Hackathon
        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        if (vehicle.status === 'RETIRED') return res.status(400).json({ message: 'Retired vehicles cannot be dispatched' });
        if (vehicle.status === 'IN_SHOP') return res.status(400).json({ message: 'In Shop vehicles cannot be dispatched' });
        if (vehicle.status === 'ON_TRIP') return res.status(400).json({ message: 'Vehicle is already on a trip' });
        if (Number(data.weight) > vehicle.capacity) return res.status(400).json({ message: 'Weight exceeds vehicle capacity' });

        const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        if (driver.status === 'SUSPENDED') return res.status(400).json({ message: 'Suspended drivers cannot be assigned' });
        if (driver.status === 'ON_TRIP') return res.status(400).json({ message: 'Driver already On Trip cannot be reused' });
        if (new Date(driver.licenseExpiry) < new Date()) return res.status(400).json({ message: 'Expired license cannot be assigned' });

        const [newTrip] = await prisma.$transaction([
          prisma.trip.create({
            data: {
              source: data.source,
              destination: data.destination,
              vehicleId: data.vehicleId,
              driverId: data.driverId,
              cargo: data.cargo,
              distance: Number(data.distance),
              weight: Number(data.weight),
              status: 'DISPATCHED',
              scheduledDeparture: new Date(data.scheduledDeparture),
              estimatedArrival: new Date(data.estimatedArrival),
              actualDeparture: new Date(),
            }
          }),
          prisma.vehicle.update({
            where: { id: data.vehicleId },
            data: { status: 'ON_TRIP' }
          }),
          prisma.driver.update({
            where: { id: data.driverId },
            data: { status: 'ON_TRIP' }
          })
        ]);
        return res.status(201).json(newTrip);
      } catch (error: any) {
        console.error('Create trip error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
