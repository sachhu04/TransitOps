import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  return requireAuth(async (req, res, user) => {
    try {
      const { notificationId } = req.body;

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      if (notificationId.startsWith('driver-')) {
        if (!['SAFETY_OFFICER', 'FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
          return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        const driverId = notificationId.replace('driver-', '');

        // Extend license by 1 year
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await prisma.driver.update({
          where: { id: driverId },
          data: { licenseExpiry: oneYearFromNow },
        });

        return res.status(200).json({ message: 'License renewed successfully' });
      } else if (notificationId.startsWith('vehicle-')) {
        if (!['FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
          return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        const vehicleId = notificationId.replace('vehicle-', '');

        // Mark vehicle as available
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'AVAILABLE' },
        });

        return res.status(200).json({ message: 'Vehicle marked as available' });
      } else if (notificationId === 'pending-trips') {
        if (!['DISPATCHER', 'FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
          return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        // Just for UI purposes, we could mark them or ignore
        return res.status(200).json({ message: 'Trips acknowledged' });
      }

      return res.status(400).json({ message: 'Invalid notification type' });
    } catch (error) {
      console.error('Resolution error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
