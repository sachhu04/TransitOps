# TransitOps Backend Architecture

This document provides a comprehensive overview of the backend implementation for the TransitOps application, architected specifically to support enterprise-grade fleet management.

## Technology Stack

- **Database System**: Supabase (Managed PostgreSQL)
- **Object-Relational Mapping (ORM)**: Prisma Client
- **API Framework**: Next.js API Routes (Serverless Functions)
- **Authentication**: Stateless JSON Web Tokens (JWT) & bcrypt
- **Connection Management**: Supabase PgBouncer (Transaction Pooling)
- **Data Fetching**: SWR (Stale-While-Revalidate)

## Environment Configuration

Because TransitOps relies on a serverless architecture (Vercel), standard database connections can quickly exhaust connection limits. To solve this, the application leverages **Supabase Connection Pooling (PgBouncer)**.

### Local Configuration

1. **Setup Environment Variables**
   Create a `.env` file in the root directory. You must configure two separate connection strings to correctly utilize Prisma with Supabase in a serverless context:

   ```env
   # Transaction Pooler (Used for application queries)
   # Must include ?pgbouncer=true
   DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

   # Direct Connection (Used only for Prisma migrations and schema pushes)
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

   # Security Token
   JWT_SECRET="your_secure_jwt_secret"
   ```

2. **Install Dependencies**
   Run `npm install` to install required server-side dependencies (`@prisma/client`, `bcrypt`, `jsonwebtoken`, `swr`).

3. **Prisma Configuration**
   Initialize the database schema against your Supabase instance:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Database Seeding**
   Populate the database with initial analytical metrics, vehicles, drivers, and trips:
   ```bash
   npm run seed
   # or: npx prisma db seed
   ```

5. **Start Application Server**
   ```bash
   npm run dev
   ```

## REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticates user credentials.
  - Body: `{ email, password, role }`
  - Returns: `{ token, user: { id, name, email, role } }`

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard`: Aggregates and returns top-level Key Performance Indicators (Active Vehicles, Active Trips, Utilization, Fuel Efficiency).

### Vehicles (`/api/vehicles`)
- `GET /api/vehicles`: Retrieves comprehensive vehicle telematics and status records.
- `POST /api/vehicles`: Provisions a new vehicle entity into the fleet.

### Drivers (`/api/drivers`)
- `GET /api/drivers`: Retrieves all registered drivers and their respective safety/operational scores.
- `POST /api/drivers`: Registers a new driver profile.

### Trips (`/api/trips`)
- `GET /api/trips`: Retrieves all historical and active trips, joined with specific driver and vehicle relations.
- `POST /api/trips`: Creates a trip (enforces strict logistical business rules regarding vehicle availability).
- `PATCH /api/trips/[id]/status`: Mutates trip status (`DISPATCHED`, `COMPLETED`, `CANCELLED`), automatically triggering side-effects to adjust vehicle and driver availability states.

### Maintenance (`/api/maintenance`)
- `GET /api/maintenance`: Retrieves maintenance and repair logs.
- `POST /api/maintenance`: Submits a new maintenance work order.
- `PATCH /api/maintenance/[id]/status`: Mutates log status, automatically adjusting corresponding vehicle states (`IN_SHOP` or `AVAILABLE`).

### Fuel & Analytics (`/api/fuel` & `/api/reports`)
- `GET /api/fuel`: Retrieves all fleet fuel consumption logs.
- `POST /api/fuel`: Logs a new fueling transaction.
- `GET /api/reports`: Generates complex analytical views including vehicle-specific ROI, Fuel Efficiency, and Operational Costs based on predefined currency and metric constraints.

## Client-Server Integration Status

- **Fully Integrated API**: All frontend dashboard modules directly interact with the Next.js Serverless API endpoints using SWR.
- **Authentication**: The `Login` page securely connects to `/api/auth/login` and persists the JWT as an HTTP-only cookie or local storage, attaching it securely to subsequent API requests.
- **Role-Based Access Control (RBAC)**: Strict RBAC is enforced both on the UI layer (conditional rendering) and the Server layer (API route validation).
