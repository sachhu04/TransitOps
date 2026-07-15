<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=2563eb&height=250&section=header&text=TransitOps&fontSize=70&fontColor=ffffff&animation=fadeIn" alt="TransitOps Banner" />

  <h3 align="center">Enterprise Fleet & Logistics Management Platform</h3>

  <p align="center">
    <strong>Built for the Odoo Hackathon</strong>
    <br />
    <br />
    <a href="#overview">Overview</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#system-design">System Design</a>
    ·
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## Overview

**TransitOps** is a comprehensive, end-to-end Fleet and Logistics Management platform. Built for the Odoo Hackathon, it provides a centralized dashboard to seamlessly manage vehicles, drivers, trips, maintenance, and expenses with built-in Role-Based Access Control (RBAC). The platform features a premium, minimalist "Bento Grid" user interface designed for high-density data visualization and operational efficiency.

---

## Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" />
  <img src="https://img.shields.io/badge/Recharts-000000?style=for-the-badge&logo=react&logoColor=white" alt="Recharts" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
</div>

---

## Features

**Premium Bento Grid Dashboard**  
A high-performance, minimalist interface featuring advanced Recharts data visualizations, SVG linear gradients, and responsive grid layouts for optimal data consumption.

**Enterprise Authentication & Invitations**  
Secure email invitations with isolated database schemas. Self-serve forgot password flow protected by cryptographic token hashing and strict database-level rate limiting.

**Production Email Infrastructure**  
Automated server-to-server email dispatch using Google OAuth2 (Client ID & Refresh Token) to bypass cloud SMTP blocking heuristics on Vercel.

**Fleet Management**  
Track vehicle status, health scores, mileage, and maintenance logs in real time.

**Driver Management**  
Manage driver profiles, licenses, safety scores, and duty availability.

**Trip Lifecycle Management**  
Dispatch, track, and complete trips with real-time status updates from DRAFT to COMPLETED.

**Maintenance & Fuel Logs**  
Record maintenance costs, log fuel expenses, and track overall operational efficiency.

**Analytics & Reports**  
Exportable comprehensive reports (PDF format) for fuel efficiency, ROI, and top costliest vehicles.

**Role-Based Access Control (RBAC)**  
Fine-grained permissions for Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts using JWT. Advanced admin capabilities for permanent user deletion and team management.

**Production-Grade Testing & CI/CD**  
Fully automated Continuous Integration pipeline via GitHub Actions. Features strict ESLint rules, Prettier formatting, TypeScript type-checking, and rapid Unit Testing using Vitest.

---

## System Design

TransitOps is built on a modern, serverless-ready architecture utilizing Next.js for both the frontend (Pages Router) and backend (API Routes). 

### Architecture Overview

```mermaid
graph TD
    Client(Client Browser)
    NextJS[Next.js Frontend]
    NextAPI[Next.js API Routes]
    Prisma[Prisma ORM]
    PostgreSQL[(PostgreSQL Database)]

    Client <-->|HTTP / REST| NextJS
    NextJS <-->|SWR Data Fetching| NextAPI
    NextAPI <-->|Query & Mutations| Prisma
    Prisma <-->|Connection Pool| PostgreSQL
```

### Entity Relationship Schema

The data model is highly relational, connecting vehicles to trips, maintenance, fuel, and expenses, allowing for deep analytics on operational costs. It also strictly isolates authentication lifecycles.

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String name
        Role role
        String resetToken
    }
    Invitation {
        String id PK
        String email UK
        String token UK
        DateTime expiresAt
    }
    Vehicle {
        String id PK
        String registration UK
        VehicleStatus status
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
        TripStatus status
        Float distance
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

    Vehicle ||--o{ Trip : makes
    Driver ||--o{ Trip : drives
    Vehicle ||--o{ MaintenanceLog : has
    Vehicle ||--o{ FuelLog : has
    Vehicle ||--o{ Expense : incurs
    Trip ||--o{ Expense : incurs
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Supabase)

### 1. Environment Setup

Clone the repository and install dependencies:
```bash
npm install
```

Ensure you have a running PostgreSQL instance. Update the environment variables in the `.env` file at the root of the project:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
JWT_SECRET="supersecret_jwt_key_transitops_hackathon_2026"

# Email Configuration (Google OAuth2 for Nodemailer)
EMAIL_USER="your-email@gmail.com"
GMAIL_CLIENT_ID="your_google_client_id"
GMAIL_CLIENT_SECRET="your_google_client_secret"
GMAIL_REFRESH_TOKEN="your_google_refresh_token"
```

### 2. Database Initialization

Run the Prisma commands to generate the Prisma Client and push the schema to your database:
```bash
npx prisma generate
npx prisma db push
```

Seed the database with default roles, vehicles, and mock data:
```bash
npm run seed
```

### 3. Default Credentials for Evaluator

You can use the following default credentials to log in and test different RBAC roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Fleet Manager** | `manager@transitops.in` | `password123` |
| **Dispatcher** | `dispatcher@transitops.in` | `password123` |
| **Safety Officer** | `safety@transitops.in` | `password123` |
| **Financial Analyst** | `finance@transitops.in` | `password123` |
| **Admin** | `admin@transitops.in` | `password123` |

### 4. Start Development Server

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 5. Running Tests & Code Quality Checks

This repository is maintained with a strict CI pipeline. You can run the quality checks locally:

```bash
# Run the Vitest unit testing suite
npm run test

# Run the full CI sequence (Format, Lint, Typecheck, Test, Build)
npm run ci
```

---

## API & Backend Documentation

For detailed backend integration notes, API endpoints, and authentication workflows, refer to the [Backend README](./README-BACKEND.md).

---

## License

This project is licensed under the MIT License.
