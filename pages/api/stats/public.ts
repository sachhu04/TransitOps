import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const [totalVehiclesCount, totalDriversCount] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count()
    ]);
    
    // Formatting them into strings with commas as (n-1)+
    res.status(200).json({
      registeredVehicles: totalVehiclesCount > 0 ? `${(totalVehiclesCount - 1).toLocaleString()}+` : "2,400+",
      totalDrivers: totalDriversCount > 0 ? `${(totalDriversCount - 1).toLocaleString()}+` : "8,500+"
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
