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

      if (['SAFETY_OFFICER', 'FLEET_MANAGER'].includes(user.role)) {
        fetchPromises.push(
          prisma.driver.findMany({
            where: { licenseExpiry: { lte: thirtyDaysFromNow } },
            select: { id: true, name: true, licenseExpiry: true }
          }).then(res => { expiringDrivers = res; })
        );
      }

      if (['FLEET_MANAGER'].includes(user.role)) {
        fetchPromises.push(
          prisma.vehicle.findMany({
            where: { status: 'IN_SHOP' },
            select: { id: true, registration: true }
          }).then(res => { maintenanceVehicles = res; })
        );
      }

      if (['DISPATCHER', 'FLEET_MANAGER'].includes(user.role)) {
        fetchPromises.push(
          prisma.trip.count({
            where: { status: { in: ['DRAFT', 'ASSIGNED'] } }
          }).then(res => { pendingTrips = res; })
        );
      }

      await Promise.all(fetchPromises);

      const notifications = [];

      expiringDrivers.forEach(driver => {
        const daysLeft = Math.ceil((new Date(driver.licenseExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const isExpired = daysLeft < 0;
        notifications.push({
          id: `driver-${driver.id}`,
          title: isExpired ? 'License Expired' : 'License Expiring Soon',
          description: isExpired 
            ? `${driver.name}'s license has expired!` 
            : `${driver.name}'s license expires in ${daysLeft} days.`,
          type: 'warning',
          date: new Date() // Just for sorting
        });
      });

      maintenanceVehicles.forEach(vehicle => {
        notifications.push({
          id: `vehicle-${vehicle.id}`,
          title: 'Vehicle in Maintenance',
          description: `Vehicle ${vehicle.registration} is currently in the shop.`,
          type: 'info',
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
