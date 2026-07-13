import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method !== 'PATCH') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    if (!['DISPATCHER'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    try {
      const { id } = req.query;
      const { status } = req.body; // DISPATCHED, COMPLETED, CANCELLED

      const tripId = id as string;
      const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { vehicle: true, driver: true } });
      if (!trip) return res.status(404).json({ message: 'Trip not found' });

      if (status === 'DISPATCHED') {
        if (trip.vehicle.status !== 'AVAILABLE') return res.status(400).json({ message: 'Vehicle is not available' });
        if (trip.driver.status !== 'AVAILABLE') return res.status(400).json({ message: 'Driver is not available' });
        
        await prisma.$transaction([
          prisma.trip.update({ where: { id: tripId }, data: { status: 'DISPATCHED', actualDeparture: new Date() } }),
          prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } }),
          prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } })
        ]);
        return res.status(200).json({ message: 'Trip dispatched successfully' });
      }

      if (status === 'COMPLETED') {
        if (trip.status !== 'DISPATCHED') return res.status(400).json({ message: 'Only dispatched trips can be completed' });
        await prisma.$transaction([
          prisma.trip.update({ where: { id: tripId }, data: { status: 'COMPLETED', actualArrival: new Date() } }),
          prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE', mileage: { increment: trip.distance } } }),
          prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE', tripsCompleted: { increment: 1 } } })
        ]);
        return res.status(200).json({ message: 'Trip completed successfully' });
      }

      if (status === 'CANCELLED') {
        // If it was dispatched, restore statuses to AVAILABLE. If not, just cancel.
        const tx: any[] = [ prisma.trip.update({ where: { id: tripId }, data: { status: 'CANCELLED' } }) ];
        if (trip.status === 'DISPATCHED') {
          tx.push(prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } }));
          tx.push(prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } }));
        }
        await prisma.$transaction(tx);
        return res.status(200).json({ message: 'Trip cancelled successfully' });
      }

      return res.status(400).json({ message: 'Invalid status' });
    } catch (error) {
      console.error('Trip status update error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
