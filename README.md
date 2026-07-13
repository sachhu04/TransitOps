<div align="center">
  <h1>TransitOps</h1>
  <p><strong>Enterprise-Grade Fleet Management and Logistics Platform</strong></p>
  
  <p>
    <a href="https://skillicons.dev">
      <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,supabase,vercel" alt="Technology Stack" />
    </a>
  </p>
  
  <p>
    <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&h=300&auto=format&fit=crop" alt="Logistics Banner" width="100%" style="border-radius: 12px; margin-top: 10px;" />
  </p>
</div>

TransitOps is a comprehensive fleet management and logistics platform engineered to streamline the operations of modern transport businesses. The application provides real-time tracking, intelligent dashboarding, maintenance scheduling, and financial analytics within a highly responsive, performant user interface.

## Core Features

- **Intelligent Dashboard**: High-level operational overview encompassing active fleet status, trip progression, and financial metrics through dynamic data visualization.
- **Fleet and Vehicle Management**: Granular tracking of vehicle health scores, cumulative mileage, and real-time operational status (Available, On Trip, In Shop, Retired).
- **Driver Directory**: Comprehensive monitoring of driver safety metrics, license validation periods, and historical trip execution.
- **Dispatch and Routing**: Centralized trip creation, vehicle-driver assignment, and comprehensive revenue versus expense tracking.
- **Fuel and Maintenance Logging**: Strict record-keeping protocols for fuel consumption, toll expenditures, and scheduled maintenance to optimize long-term operational costs.
- **Adaptive Interface**: Seamless transition capabilities between Light and Dark display modes to accommodate various operational environments.
- **Automated Reporting**: Instantaneous export of data tables and operational logs into strictly formatted PDF reports.

---

## System Architecture

The TransitOps platform utilizes a modern, serverless architecture optimized for high availability and low latency.

```mermaid
graph TD
    Client[Client Browser]
    Vercel[Vercel Serverless Edge]
    NextAPI[Next.js API Routes]
    Prisma[Prisma Client]
    PgBouncer[Supabase Connection Pooler]
    DB[(Supabase PostgreSQL)]

    Client -->|HTTP/REST| Vercel
    Vercel -->|Handles Pages/Auth| NextAPI
    NextAPI -->|Query Execution| Prisma
    Prisma -->|TCP 6543 / pgbouncer=true| PgBouncer
    PgBouncer -->|Transaction Pooling| DB
```

## Database Schema

The foundational data model ensures strong relational integrity across all operational entities.

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String password
        String name
        Role role
    }
    Vehicle {
        String id PK
        String registration UK
        String type
        VehicleStatus status
        Float mileage
        Float healthScore
    }
    Driver {
        String id PK
        String licenseNumber UK
        Float safetyScore
        DriverStatus status
    }
    Trip {
        String id PK
        String source
        String destination
        Float revenue
        TripStatus status
    }
    MaintenanceLog {
        String id PK
        String service
        Float cost
        MaintenanceStatus status
    }
    FuelLog {
        String id PK
        Float liters
        Float cost
    }
    Expense {
        String id PK
        ExpenseCategory type
        Float amount
    }

    Vehicle ||--o{ Trip : completes
    Driver ||--o{ Trip : drives
    Vehicle ||--o{ MaintenanceLog : undergoes
    Vehicle ||--o{ FuelLog : consumes
    Vehicle ||--o{ Expense : incurs
    Trip ||--o{ Expense : incurs
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account or local PostgreSQL instance

### Local Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sachhu04/TransitOps.git
   cd TransitOps
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root and populate it with your Supabase credentials:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
   JWT_SECRET="your_secure_jwt_secret"
   ```

4. **Synchronize the Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Populate the Database with Initial Data:**
   ```bash
   npm run seed
   # alternatively: npx prisma db seed
   ```

6. **Initialize the Development Server:**
   ```bash
   npm run dev
   ```
   Access the application via `http://localhost:3000`.

---

## Authentication and Role Management

TransitOps implements a stateless JWT authentication system. Access to specific modules is strictly governed by the user's assigned role within the database.

- **FLEET_MANAGER**: Unrestricted access to all system modules and configurations.
- **DISPATCHER**: Authorized to manage Trips, Vehicles, and Driver assignments.
- **SAFETY_OFFICER**: Authorized to monitor Vehicle Health records and Driver Safety metrics.
- **FINANCIAL_ANALYST**: Authorized access restricted to Revenue, Expenses, and Fuel Logs.

## Production Deployment

This repository is pre-configured for seamless deployment on **Vercel**. 

During the deployment configuration, ensure that `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` are added to the Vercel Project Environment Variables (omitting surrounding quotation marks). The `postinstall` script defined in `package.json` guarantees the generation of the Prisma Client during the Vercel build phase.
