import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';

const updateDriverSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  licenseNumber: z.string().min(1, 'License Number is required'),
  licenseCategory: z.string().min(1, 'License Category is required'),
  licenseExpiry: z.string().or(z.date()),
  contactNumber: z.string().regex(/^(?:\+91)?[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  safetyScore: z.number().min(0).max(100).optional().default(100),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional().default('AVAILABLE'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(async (req, res, user) => {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    if (req.method === 'GET') {
      if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const driver = await prisma.driver.findUnique({ where: { id } });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        return res.status(200).json(driver);
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'PUT') {
      if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const validation = updateDriverSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: validation.error.issues[0].message });
        }
        const data = validation.data;

        // Check if license number exists for another driver
        const existing = await prisma.driver.findFirst({
          where: {
            licenseNumber: data.licenseNumber,
            id: { not: id }
          }
        });
        if (existing) {
          return res.status(400).json({ message: 'License number already exists.' });
        }

        const updatedDriver = await prisma.driver.update({
          where: { id },
          data: {
            name: data.name,
            licenseNumber: data.licenseNumber,
            licenseExpiry: new Date(data.licenseExpiry),
            safetyScore: data.safetyScore,
            status: data.status,
            avatar: JSON.stringify({ contact: data.contactNumber, category: data.licenseCategory })
          }
        });

        return res.status(200).json({
          ...updatedDriver,
          contactNumber: data.contactNumber,
          licenseCategory: data.licenseCategory,
          avatar: null
        });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to update driver.' });
      }
    } else if (req.method === 'DELETE') {
      if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const driver = await prisma.driver.findUnique({
          where: { id },
          include: { trips: true }
        });

        if (!driver) {
          return res.status(404).json({ message: 'Driver not found.' });
        }

        const hasActiveTrip = driver.trips.some(t => ['ASSIGNED', 'DISPATCHED'].includes(t.status));
        if (hasActiveTrip) {
          return res.status(400).json({ message: 'Driver is currently assigned to an active trip.' });
        }

        await prisma.driver.delete({ where: { id } });
        return res.status(200).json({ message: 'Driver deleted successfully.' });
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
