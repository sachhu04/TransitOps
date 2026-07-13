<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=2563eb&height=250&section=header&text=TransitOps&fontSize=70&fontColor=ffffff&animation=fadeIn" alt="TransitOps Banner" />

  <h3 align="center">A Modern Fleet & Logistics Management SaaS Platform</h3>

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

<br/>

## Overview

**TransitOps** is a comprehensive, end-to-end Fleet and Logistics Management platform. Built for the Odoo Hackathon, it provides a centralized dashboard to seamlessly manage vehicles, drivers, trips, maintenance, and expenses with built-in Role-Based Access Control (RBAC).

<br/>

## Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

<br/>

## Features

- **Interactive Dashboard**<br/>
  High-level KPIs, fleet utilization, active trip tracking, and beautifully rendered charts.

- **Fleet Management**<br/>
  Track vehicle status, health scores, mileage, and maintenance logs in real time.

- **Driver Management**<br/>
  Manage driver profiles, licenses, safety scores, and duty availability.

- **Trip Lifecycle Management**<br/>
  Dispatch, track, and complete trips with real-time status updates from `DRAFT` to `COMPLETED`.

- **Maintenance & Fuel Logs**<br/>
  Record maintenance costs, log fuel expenses, and track overall operational efficiency.

- **Analytics & Reports**<br/>
  Exportable comprehensive reports (PDF & CSV) for fuel efficiency, ROI, and top costliest vehicles.

- **Role-Based Access Control (RBAC)**<br/>
  Fine-grained permissions for Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts using JWT.

<br/>

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

Our data model is highly relational, connecting vehicles to trips, maintenance, fuel, and expenses, allowing for deep analytics on operational costs.

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String name
        Role role
    }
    Vehicle {
        String id PK
        String registration UK
        String type
        VehicleStatus status
        Float healthScore
    }
    Driver {
        String id PK
        String name
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
        String type
        Float amount
    }

    Vehicle ||--o{ Trip : "makes"
    Driver ||--o{ Trip : "drives"
    Vehicle ||--o{ MaintenanceLog : "has"
    Vehicle ||--o{ FuelLog : "has"
    Vehicle ||--o{ Expense : "incurs"
    Trip ||--o{ Expense : "incurs"
```

<br/>

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** database

### 1. Environment Setup

Clone the repository and install dependencies:
```bash
npm install
```

Ensure you have a running PostgreSQL instance. Update the `DATABASE_URL` and `JWT_SECRET` in the `.env` file at the root of the project:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transitops?schema=public"
JWT_SECRET="supersecret_jwt_key_transitops_hackathon_2026"
```

### 2. Database Initialization

Run the Prisma commands to generate the Prisma Client and push the schema to your database:
```bash
npx prisma generate
npx prisma db push
```

Seed the database with default roles, vehicles, and mock data:
```bash
npx prisma db seed
```
> **Note**: This will automatically populate the database with default users and mock data so you can immediately interact with the dashboard.

### 3. Default Credentials for Evaluator

You can use the following default credentials to log in and test different RBAC roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Fleet Manager** | `manager@transitops.in` | `password123` |
| **Dispatcher** | `dispatcher@transitops.in` | `password123` |
| **Safety Officer** | `safety@transitops.in` | `password123` |
| **Financial Analyst** | `finance@transitops.in` | `password123` |

### 4. Start Development Server

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

<br/>

## API & Backend Documentation

For detailed backend integration notes, API endpoints, and authentication workflows, refer to the [Backend README](./README-BACKEND.md).

<br/>

## License

This project is licensed under the MIT License.
