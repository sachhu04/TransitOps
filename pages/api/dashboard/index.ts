import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  return requireAuth(async (req, res, user) => {
    try {
      const { region, type, status } = req.query;

      // Base query for vehicles
      const vehicleWhere: any = {};
      if (type) vehicleWhere.type = type as string;
      if (status) vehicleWhere.status = status as string;
      if (region) vehicleWhere.region = region as string;
      
      const [
        vehicleCounts,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        totalDistanceAgg,
        totalFuelAgg,
        totalFuelCostAgg,
        totalMaintenanceCostAgg,
        totalDrivers,
        availableDrivers,
        offDutyDrivers,
        suspendedDrivers
      ] = await Promise.all([
        prisma.vehicle.groupBy({ by: ['status'], where: vehicleWhere, _count: { _all: true } }),
        prisma.trip.count({ where: { status: 'DISPATCHED', vehicle: vehicleWhere } }),
        prisma.trip.count({ where: { status: { in: ['DRAFT', 'ASSIGNED'] }, vehicle: vehicleWhere } }),
        prisma.driver.count({ where: { status: 'ON_TRIP' } }),
        prisma.trip.aggregate({ _sum: { distance: true }, where: { status: 'COMPLETED', vehicle: vehicleWhere } }),
        prisma.fuelLog.aggregate({ _sum: { liters: true, cost: true }, where: { vehicle: vehicleWhere } }),
        prisma.fuelLog.aggregate({ _sum: { cost: true }, where: { vehicle: vehicleWhere } }),
        prisma.maintenanceLog.aggregate({ _sum: { cost: true }, where: { vehicle: vehicleWhere } }),
        prisma.driver.count(),
        prisma.driver.count({ where: { status: 'AVAILABLE' } }),
        prisma.driver.count({ where: { status: 'OFF_DUTY' } }),
        prisma.driver.count({ where: { status: 'SUSPENDED' } })
      ]);

      let totalVehicles = 0;
      let activeVehicles = 0;
      let availableVehicles = 0;
      let maintenanceVehicles = 0;

      for (const vc of vehicleCounts) {
        totalVehicles += vc._count._all;
        if (vc.status === 'ON_TRIP') activeVehicles = vc._count._all;
        if (vc.status === 'AVAILABLE') availableVehicles = vc._count._all;
        if (vc.status === 'IN_SHOP') maintenanceVehicles = vc._count._all;
      }

      const totalDistance = totalDistanceAgg._sum.distance || 0;
      const totalFuel = totalFuelAgg._sum.liters || 0;
      
      const metrics = {
        activeVehicles,
        availableVehicles,
        maintenanceVehicles,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization: totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0,
        fuelEfficiency: totalFuel > 0 ? totalDistance / totalFuel : 0,
        operationalCost: (totalFuelCostAgg._sum.cost || 0) + (totalMaintenanceCostAgg._sum.cost || 0),
        totalDrivers,
        availableDrivers,
        offDutyDrivers,
        suspendedDrivers
      };

      res.status(200).json(metrics);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
