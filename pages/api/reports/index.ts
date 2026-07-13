import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  return requireAuth(async (req, res, user) => {
    if (!['FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    try {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          fuelLogs: true,
          maintenance: true,
          trips: {
            where: { status: 'COMPLETED' }
          }
        }
      });

      const reports = vehicles.map(vehicle => {
        const totalDistance = vehicle.trips.reduce((acc, trip) => acc + trip.distance, 0);
        const totalFuelLiters = vehicle.fuelLogs.reduce((acc, log) => acc + log.liters, 0);
        const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;
        
        const fuelCost = vehicle.fuelLogs.reduce((acc, log) => acc + log.cost, 0);
        const maintenanceCost = vehicle.maintenance.reduce((acc, log) => acc + log.cost, 0);
        const operationalCost = fuelCost + maintenanceCost;
        
        // Assume revenue is a function of distance or a fixed rate. For hackathon, let's say 50 INR per km.
        // Wait, the UI has Indian locale reqs, and distance might be in km. Let's use 50 INR per distance unit.
        const revenue = totalDistance * 50; 
        
        // Assume Acquisition cost is fixed or random for demo purposes unless added to model.
        // Let's use a fixed 1,500,000 INR (15 Lakhs) for ROI calculation.
        const acquisitionCost = vehicle.acquisitionCost || 1500000;
        const roi = ((revenue - operationalCost) / acquisitionCost) * 100;

        return {
          id: vehicle.id,
          registration: vehicle.registration,
          totalDistance,
          totalFuelLiters,
          fuelEfficiency,
          fuelCost,
          maintenanceCost,
          operationalCost,
          revenue,
          roi
        };
      });

      res.status(200).json(reports);
    } catch (error) {
      console.error('Reports error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
