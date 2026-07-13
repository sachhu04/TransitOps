import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';

const createDriverSchema = z.object({
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
    if (req.method === 'GET') {
      if (!['FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const { search, status, sort, order } = req.query;
        let whereClause: any = {};
        
        if (search) {
          whereClause.OR = [
            { name: { contains: String(search), mode: 'insensitive' } },
            { licenseNumber: { contains: String(search), mode: 'insensitive' } },
          ];
        }
        
        if (status && status !== 'ALL') {
          whereClause.status = status;
        }

        let orderByClause: any = { createdAt: 'desc' };
        if (sort) {
          const sortOrder = order === 'asc' ? 'asc' : 'desc';
          if (sort === 'name') orderByClause = { name: sortOrder };
          else if (sort === 'safetyScore') orderByClause = { safetyScore: sortOrder };
          else if (sort === 'licenseExpiry') orderByClause = { licenseExpiry: sortOrder };
          else if (sort === 'status') orderByClause = { status: sortOrder };
          else if (sort === 'newest') orderByClause = { createdAt: 'desc' };
          else if (sort === 'oldest') orderByClause = { createdAt: 'asc' };
        }

        const drivers = await prisma.driver.findMany({
          where: whereClause,
          orderBy: orderByClause
        });
        return res.status(200).json(drivers);
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      try {
        const validation = createDriverSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: validation.error.issues[0].message });
        }

        const data = validation.data;

        const existing = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
        if (existing) {
          return res.status(400).json({ message: 'License number already exists.' });
        }

        const newDriver = await prisma.driver.create({
          data: {
            name: data.name,
            licenseNumber: data.licenseNumber,
            licenseExpiry: new Date(data.licenseExpiry),
            safetyScore: data.safetyScore,
            experienceYears: 0,
            status: data.status,
            // storing contact and category in avatar field since we cannot modify schema
            avatar: JSON.stringify({ contact: data.contactNumber, category: data.licenseCategory })
          }
        });
        
        // parse it back before returning
        return res.status(201).json({
          ...newDriver,
          contactNumber: data.contactNumber,
          licenseCategory: data.licenseCategory,
          avatar: null
        });
      } catch (error: any) {
        console.error('Driver creation error:', error);
        return res.status(500).json({ message: error.message || 'Failed to save driver.' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  })(req, res);
}
