import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  return requireAuth(async (req, res, user) => {
    try {
      const { region, type, status } = req.query;

      // Base query for vehicles
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vehicleWhere: any = {};
      if (type) vehicleWhere.type = type as string;
      if (status) vehicleWhere.status = status as string;
      if (region) vehicleWhere.region = region as string;

      const [
        vehicleCounts,
        activeTrips,
        pendingTrips,
        totalDistanceAgg,
        totalFuelAgg,
        totalMaintenanceCostAgg,
        driverCounts,
      ] = await Promise.all([
        prisma.vehicle.groupBy({ by: ['status'], where: vehicleWhere, _count: { _all: true } }),
        prisma.trip.count({ where: { status: 'DISPATCHED', vehicle: vehicleWhere } }),
        prisma.trip.count({
          where: { status: { in: ['DRAFT', 'ASSIGNED'] }, vehicle: vehicleWhere },
        }),
        prisma.trip.aggregate({
          _sum: { distance: true },
          where: { status: 'COMPLETED', vehicle: vehicleWhere },
        }),
        prisma.fuelLog.aggregate({
          _sum: { liters: true, cost: true },
          where: { vehicle: vehicleWhere },
        }),
        prisma.maintenanceLog.aggregate({ _sum: { cost: true }, where: { vehicle: vehicleWhere } }),
        prisma.driver.groupBy({ by: ['status'], _count: { _all: true } }),
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

      let totalDrivers = 0;
      let availableDrivers = 0;
      let offDutyDrivers = 0;
      let suspendedDrivers = 0;
      let driversOnDuty = 0;

      for (const dc of driverCounts) {
        totalDrivers += dc._count._all;
        if (dc.status === 'AVAILABLE') availableDrivers = dc._count._all;
        if (dc.status === 'OFF_DUTY') offDutyDrivers = dc._count._all;
        if (dc.status === 'SUSPENDED') suspendedDrivers = dc._count._all;
        if (dc.status === 'ON_TRIP') driversOnDuty = dc._count._all;
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
        operationalCost: (totalFuelAgg._sum.cost || 0) + (totalMaintenanceCostAgg._sum.cost || 0),
        totalDrivers,
        availableDrivers,
        offDutyDrivers,
        suspendedDrivers,
      };

      res.status(200).json(metrics);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })(req, res);
}
