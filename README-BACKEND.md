# TransitOps Backend Integration

This document outlines the backend implementation for the TransitOps application, designed for the Odoo Hackathon.

## Tech Stack
- **Database**: PostgreSQL (via Prisma ORM)
- **Framework**: Next.js API Routes (Pages Router)
- **Auth**: JWT + bcrypt
- **Data Fetching**: SWR / React Query

## Setup Instructions

1. **Database Setup**
   Ensure you have a running PostgreSQL instance. Update the `DATABASE_URL` in the `.env` file at the root of the project to point to your database.
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transitops?schema=public"
   JWT_SECRET="supersecret_jwt_key_transitops_hackathon_2026"
   ```

2. **Install Dependencies**
   Run `npm install` to install all dependencies including the newly added backend packages (`@prisma/client`, `bcrypt`, `jsonwebtoken`, `swr`).

3. **Prisma Configuration**
   Run the following commands to initialize your database structure and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Database Seeding**
   To replace mock data with real database entries, run the seed script:
   ```bash
   npx prisma db seed
   ```
   *Note: This will populate the database with default users (Admin, Driver, Safety Officer, Financial Analyst) and the mock data provided in `data/mock.ts` converted into PostgreSQL tables.*

5. **Start Application**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticates a user.
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, name, email, role } }`

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard`: Aggregates KPIs (Active Vehicles, Active Trips, Utilization, Fuel Efficiency).

### Vehicles (`/api/vehicles`)

- `GET /api/vehicles`: Retrieves all vehicles.
- `POST /api/vehicles`: Creates a new vehicle.

### Drivers (`/api/drivers`)
- `GET /api/drivers`: Retrieves all drivers.
- `POST /api/drivers`: Creates a new driver.

### Trips (`/api/trips`)
- `GET /api/trips`: Retrieves all trips with related driver/vehicle data.
- `POST /api/trips`: Creates a trip (enforces Hackathon business rules).
- `PATCH /api/trips/[id]/status`: Updates trip status to `DISPATCHED`, `COMPLETED`, or `CANCELLED`, automatically adjusting vehicle and driver availability.

### Maintenance (`/api/maintenance`)
- `GET /api/maintenance`: Retrieves maintenance logs.
- `POST /api/maintenance`: Creates a maintenance log.
- `PATCH /api/maintenance/[id]/status`: Updates log status, moving vehicle to `IN_SHOP` or `AVAILABLE`.

### Fuel & Reports (`/api/fuel` & `/api/reports`)
- `GET /api/fuel`: Retrieves all fuel logs.
- `POST /api/fuel`: Creates a new fuel entry.
- `GET /api/reports`: Computes vehicle-specific ROI, Fuel Efficiency, and Operational Costs based on Indian constraints (INR / KM).

## UI Integration Status
- The frontend is now fully integrated with the Next.js API endpoints.
- **Authentication**: The `Login` page securely connects to `/api/auth/login` and stores the JWT in `localStorage`.
- **RBAC**: Role-Based Access Control is actively enforced across both UI navigation and API routes.
- **All Modules Integrated**: `Dashboard`, `Analytics`, `Fleet`, `Drivers`, `Trips`, `Maintenance`, `Fuel`, and `Settings` have been successfully migrated to use live database API calls and SWR mutations, replacing the initial `mock.ts` setup.
