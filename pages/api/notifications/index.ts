import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  return requireAuth(async (req, res, user) => {
    try {
      let expiringDrivers: any[] = [];
      let maintenanceVehicles: any[] = [];
      let pendingTrips = 0;

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const fetchPromises = [];

      if (['SAFETY_OFFICER', 'FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
        fetchPromises.push(
          prisma.driver.findMany({
            where: { licenseExpiry: { lte: thirtyDaysFromNow }, isArchived: false },
            select: { id: true, name: true, licenseExpiry: true }
          }).then(res => { expiringDrivers = res; })
        );
      }

      if (['FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
        fetchPromises.push(
          prisma.vehicle.findMany({
            where: { status: 'IN_SHOP' },
            select: { id: true, registration: true }
          }).then(res => { maintenanceVehicles = res; })
        );
      }

      if (['DISPATCHER', 'FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
        fetchPromises.push(
          prisma.trip.count({
            where: { status: { in: ['DRAFT', 'ASSIGNED'] } }
          }).then(res => { pendingTrips = res; })
        );
      }

      await Promise.all(fetchPromises);

      const notifications = [];

      expiringDrivers.forEach(driver => {
        notifications.push({
          id: `driver-${driver.id}`,
          type: 'warning',
          title: 'License Expiring',
          description: `${driver.name}'s license is expiring on ${new Date(driver.licenseExpiry).toLocaleDateString()}`,
          date: new Date()
        });
      });

      maintenanceVehicles.forEach(vehicle => {
        notifications.push({
          id: `vehicle-${vehicle.id}`,
          type: 'info',
          title: 'Vehicle in Maintenance',
          description: `Vehicle ${vehicle.registration} is currently in the shop.`,
          date: new Date()
        });
      });

      if (pendingTrips > 0) {
        notifications.push({
          id: 'pending-trips',
          title: 'Pending Trips',
          description: `You have ${pendingTrips} trips waiting to be dispatched.`,
          type: 'alert',
          date: new Date()
        });
      }

      res.status(200).json(notifications);
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
