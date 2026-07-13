<div align="center">
  <h1>🚍 TransitOps</h1>
  <p><strong>A comprehensive, modern fleet management and logistics platform built to streamline transport operations.</strong></p>
  
  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
  </p>
  <p>
    <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&h=300&auto=format&fit=crop" alt="Logistics Banner" width="100%" style="border-radius: 12px; margin-top: 10px;" />
  </p>
</div>

TransitOps provides real-time tracking, intelligent dashboarding, maintenance scheduling, and financial analytics—all wrapped in a stunning, fully responsive UI.

## ✨ Features

- **📊 Intelligent Dashboard**: Get a bird's-eye view of your entire fleet, active trips, and financial metrics with beautiful charts.
- **🚚 Fleet & Vehicle Management**: Track vehicle health scores, mileage, and real-time status (Available, On Trip, In Shop, Retired).
- **👷 Driver Directory**: Monitor driver safety scores, license expirations, and trip histories.
- **🗺️ Dispatch & Routing**: Create and manage trips, assign drivers and vehicles, and track revenue vs. expenses.
- **⛽ Fuel & Maintenance Logs**: Keep detailed records of fuel consumption, tolls, and scheduled maintenance to optimize costs.
- **🌓 Adaptive UI**: Buttery-smooth transitions between Light and Dark mode with a seamless toggle experience.
- **📄 PDF Reporting**: Instantly export data tables and logs into beautifully formatted PDF reports.

---

## 🏗️ System Architecture

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
    NextAPI -->|Query| Prisma
    Prisma -->|TCP 6543 / pgbouncer=true| PgBouncer
    PgBouncer -->|Transaction Pooling| DB
```

## 🗄️ Database Schema

The core of TransitOps is its relational data model, ensuring strong data integrity across all operations:

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

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase account (or local PostgreSQL database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sachhu04/TransitOps.git
   cd TransitOps
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase connection strings:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
   JWT_SECRET="your_super_secret_jwt_key"
   ```

4. **Sync the Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Seed the Database with Mock Data:**
   ```bash
   npm run seed
   # or
   npx prisma db seed
   ```

6. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the application.

---

## 🔒 Authentication & Roles

TransitOps uses stateless JWT authentication. When logging in, you must select the role that matches your account's assigned role in the database.

- **FLEET_MANAGER**: Full access to all modules.
- **DISPATCHER**: Manage Trips, Vehicles, and Drivers.
- **SAFETY_OFFICER**: Monitor Vehicle Health and Driver Safety Scores.
- **FINANCIAL_ANALYST**: Access to Revenue, Expenses, and Fuel Logs.

## 🚢 Deployment

This project is optimized for deployment on **Vercel**. 
When deploying, make sure to add `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` to your Vercel Project Environment Variables (without surrounding quotation marks). The `postinstall` script in `package.json` will automatically generate the Prisma Client during the Vercel build process.
