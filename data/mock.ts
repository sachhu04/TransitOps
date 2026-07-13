let seed = 12345;
const random = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
export type VehicleStatus = "Available" | "On Trip" | "Maintenance" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type TripStatus = "Draft" | "Assigned" | "Dispatched" | "Completed" | "Cancelled";

export interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  type: string;
  status: VehicleStatus;
  mileage: number;
  lastService: string;
  healthScore: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  experienceYears: number;
  tripsCompleted: number;
  status: DriverStatus;
  avatar: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargo: string;
  distance: number;
  weight: number;
  status: TripStatus;
  scheduledDeparture: string;
  actualDeparture?: string;
  estimatedArrival: string;
  actualArrival?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  service: string;
  date: string;
  technician: string;
  cost: number;
  status: "Completed" | "Scheduled" | "In Progress";
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  location: string;
}

const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(4, '0')}`;

const US_CITIES = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA"];
const MAKES = ["Volvo", "Freightliner", "Peterbilt", "Kenworth", "Mack"];

export const mockVehicles: Vehicle[] = Array.from({ length: 60 }).map((_, i) => ({
  id: generateId('VEH', i + 1),
  registration: `TRK-${Math.floor(random() * 9000) + 1000}`,
  make: MAKES[i % MAKES.length],
  model: "VNL 860",
  year: 2018 + (i % 6),
  type: i % 5 === 0 ? "Reefer" : "Dry Van",
  status: (i % 10 === 0) ? "Maintenance" : (i % 8 === 0) ? "Retired" : (i % 2 === 0) ? "On Trip" : "Available",
  mileage: Math.floor(random() * 500000) + 10000,
  lastService: new Date(1704067200000 - random() * 10000000000).toISOString().split('T')[0],
  healthScore: Math.floor(random() * 30) + 70,
}));

export const mockDrivers: Driver[] = Array.from({ length: 45 }).map((_, i) => ({
  id: generateId('DRV', i + 1),
  name: `Driver ${i + 1}`,
  licenseNumber: `CDL-${Math.floor(random() * 9000000) + 1000000}`,
  licenseExpiry: new Date(1704067200000 + random() * 100000000000).toISOString().split('T')[0],
  safetyScore: Math.floor(random() * 20) + 80,
  experienceYears: Math.floor(random() * 25) + 1,
  tripsCompleted: Math.floor(random() * 500) + 10,
  status: (i % 15 === 0) ? "Suspended" : (i % 5 === 0) ? "Off Duty" : (i % 2 === 0) ? "On Trip" : "Available",
  avatar: "",
}));

export const mockTrips: Trip[] = Array.from({ length: 120 }).map((_, i) => ({
  id: generateId('TRP', i + 1),
  source: US_CITIES[i % US_CITIES.length],
  destination: US_CITIES[(i + 3) % US_CITIES.length],
  vehicleId: mockVehicles[i % mockVehicles.length].id,
  driverId: mockDrivers[i % mockDrivers.length].id,
  cargo: i % 3 === 0 ? "Electronics" : i % 2 === 0 ? "Produce" : "Industrial Parts",
  distance: Math.floor(random() * 2000) + 100,
  weight: Math.floor(random() * 40000) + 5000,
  status: (i < 10) ? "Draft" : (i < 30) ? "Assigned" : (i < 70) ? "Dispatched" : (i < 115) ? "Completed" : "Cancelled",
  scheduledDeparture: new Date(1704067200000 + (i - 60) * 86400000).toISOString().split('T')[0],
  estimatedArrival: new Date(1704067200000 + (i - 58) * 86400000).toISOString().split('T')[0],
}));

export const mockMaintenanceLogs: MaintenanceLog[] = Array.from({ length: 80 }).map((_, i) => ({
  id: generateId('MNT', i + 1),
  vehicleId: mockVehicles[i % mockVehicles.length].id,
  service: i % 2 === 0 ? "Oil Change & Filter" : i % 3 === 0 ? "Brake Replacement" : "Tire Rotation",
  date: new Date(1704067200000 - random() * 10000000000).toISOString().split('T')[0],
  technician: `Tech ${Math.floor(random() * 10) + 1}`,
  cost: Math.floor(random() * 1500) + 200,
  status: i < 60 ? "Completed" : i < 70 ? "In Progress" : "Scheduled",
}));

export const mockFuelLogs: FuelLog[] = Array.from({ length: 200 }).map((_, i) => ({
  id: generateId('FUEL', i + 1),
  vehicleId: mockVehicles[i % mockVehicles.length].id,
  date: new Date(1704067200000 - random() * 15000000000).toISOString().split('T')[0],
  liters: Math.floor(random() * 150) + 50,
  cost: Math.floor(random() * 600) + 150,
  location: `Pilot Travel Center - ${US_CITIES[i % US_CITIES.length]}`,
}));
