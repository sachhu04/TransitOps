import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method !== 'PATCH') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    if (user.role !== 'FLEET_MANAGER') {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    try {
      const { id } = req.query;
      const { status } = req.body;

      const logId = id as string;
      const log = await prisma.maintenanceLog.findUnique({ where: { id: logId }, include: { vehicle: true } });
      if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

      const tx: any[] = [
        prisma.maintenanceLog.update({ where: { id: logId }, data: { status } })
      ];

      if (status === 'IN_PROGRESS') {
        tx.push(prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'IN_SHOP' } }));
      } else if (status === 'COMPLETED' && log.vehicle.status !== 'RETIRED') {
        tx.push(prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } }));
      }

      await prisma.$transaction(tx);

      return res.status(200).json({ message: 'Maintenance status updated successfully' });
    } catch (error) {
      console.error('Maintenance status update error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
