import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    if (req.method === 'GET') {
      try {
        const logs = await prisma.maintenanceLog.findMany({
          include: { vehicle: true },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(logs);
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      if (user.role !== 'FLEET_MANAGER') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const data = req.body;
        const status = data.status || 'SCHEDULED';

        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        const tx: any[] = [];
        let newLog: any;

        if (status === 'IN_PROGRESS') {
          const [createdLog] = await prisma.$transaction([
            prisma.maintenanceLog.create({
              data: {
                vehicleId: data.vehicleId,
                service: data.service,
                date: new Date(data.date),
                technician: data.technician,
                cost: Number(data.cost),
                status: status
              }
            }),
            prisma.vehicle.update({ where: { id: data.vehicleId }, data: { status: 'IN_SHOP' } })
          ]);
          newLog = createdLog;
        } else {
          newLog = await prisma.maintenanceLog.create({
            data: {
              vehicleId: data.vehicleId,
              service: data.service,
              date: new Date(data.date),
              technician: data.technician,
              cost: Number(data.cost),
              status: status
            }
          });
        }

        return res.status(201).json(newLog);
      } catch (error: any) {
        console.error('Maintenance error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
