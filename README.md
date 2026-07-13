<div align="center">
  <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&h=300&auto=format&fit=crop" alt="TransitOps Logistics Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px; object-fit: cover; max-height: 250px;" />

  <h1>TransitOps</h1>
  <p><strong>Enterprise-Grade Fleet Management and Logistics Platform</strong></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" /></a>
    <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" />
  </p>

  <p>
    <a href="#-about-transitops">About</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-architecture">Architecture</a> •
    <a href="#-installation--local-development">Installation</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 📖 About TransitOps

**TransitOps** is a production-ready, comprehensive fleet management and logistics platform engineered to streamline the operations of modern transport businesses. Built with high performance and scalable systems in mind, the platform provides real-time tracking, intelligent dispatching, maintenance scheduling, and in-depth financial analytics—all wrapped in an elegant and highly responsive user interface.

Whether you're managing a small regional fleet or a massive logistics network, TransitOps offers the technical foundation to orchestrate your entire transportation lifecycle securely and efficiently.

---

## 🎯 Why This Project?

Managing a logistics fleet typically involves fragmented spreadsheets, legacy software, and siloed data. **TransitOps** centralizes this workflow into a single cohesive platform. 

It was designed to showcase how modern web technologies like **Next.js**, **Prisma**, and **Supabase** can be integrated to build enterprise-grade applications. It demonstrates complex state management, secure role-based access control (RBAC), robust relational database design, and a heavily optimized UI using `shadcn/ui` and `Tailwind CSS`.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📊 **Intelligent Dashboard** | High-level operational overview encompassing active fleet status, trip progression, and financial metrics with dynamic data visualization using **Recharts**. |
| 🚚 **Fleet Management** | Granular tracking of vehicle health scores, cumulative mileage, and real-time operational status (Available, On Trip, In Shop, Retired). |
| 👨‍✈️ **Driver Directory** | Comprehensive monitoring of driver safety metrics, license validation periods, and historical trip execution. |
| 🗺️ **Dispatch & Routing** | Centralized trip creation, vehicle-driver assignment, and full lifecycle tracking of routes from drafting to completion. |
| ⛽ **Fuel & Maintenance** | Strict record-keeping protocols for fuel consumption, toll expenditures, and scheduled maintenance to optimize long-term operational costs. |
| 🔐 **Role-Based Access** | Secure, stateless JWT authentication restricting modules based on user roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst). |
| 📄 **Automated Reporting** | Instantaneous export of data tables and operational logs into strictly formatted PDF reports utilizing `jsPDF`. |
| 🌗 **Adaptive Interface** | Built-in seamless transition between Light and Dark modes to accommodate various operational environments and user preferences. |

---

## 📸 Screenshots

> **Note:** The following are placeholder screenshots representing the user interface. 

<div align="center">
  <img src="https://via.placeholder.com/900x500/0f172a/ffffff?text=TransitOps+Dashboard+Interface" alt="Dashboard Overview" width="100%" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
  <p><i>The central dashboard providing real-time financial analytics and fleet status.</i></p>
</div>

<details>
<summary><b>View more application screenshots</b></summary>

<br />

<div align="center">
  <img src="https://via.placeholder.com/900x500/0f172a/ffffff?text=Vehicle+Fleet+Management" alt="Vehicle Management" width="49%" style="border-radius: 8px;" />
  <img src="https://via.placeholder.com/900x500/0f172a/ffffff?text=Dispatch+and+Active+Trips" alt="Dispatch & Routing" width="49%" style="border-radius: 8px;" />
</div>
<br />
<div align="center">
  <img src="https://via.placeholder.com/900x500/0f172a/ffffff?text=Driver+Performance+Directory" alt="Driver Directory" width="49%" style="border-radius: 8px;" />
  <img src="https://via.placeholder.com/900x500/0f172a/ffffff?text=Maintenance+Scheduling" alt="Maintenance Logging" width="49%" style="border-radius: 8px;" />
</div>

</details>

---

## 💻 Tech Stack

TransitOps leverages a modern, robust, and strongly-typed technology stack.

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (Pages Router)
- **UI Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Backend & Database
- **API Architecture:** Next.js Serverless API Routes
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Managed Database Hosting:** [Supabase](https://supabase.com/)
- **Authentication:** Custom JWT (JSON Web Tokens) with `bcrypt` encryption

### Infrastructure & Operations
- **Hosting / Edge Network:** [Vercel](https://vercel.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Linting & Formatting:** ESLint

---

## 🏛 Project Architecture

TransitOps utilizes a highly scalable **serverless architecture** optimized for high availability, minimal latency, and zero infrastructure maintenance.

### Request Flow Architecture

```mermaid
graph TD
    Client[Client Browser / Mobile]
    Vercel[Vercel Serverless Edge]
    NextAPI[Next.js API Routes]
    Prisma[Prisma Client]
    PgBouncer[Supabase Connection Pooler]
    DB[(Supabase PostgreSQL)]

    Client -->|HTTP/REST| Vercel
    Vercel -->|Handles UI & Auth| NextAPI
    NextAPI -->|Query Execution| Prisma
    Prisma -->|TCP 6543 / pgbouncer=true| PgBouncer
    PgBouncer -->|Transaction Pooling| DB
```

---

## 🗄️ Database Schema

The foundational data model ensures strong relational integrity across all operational entities. 

<details>
<summary><b>View Entity Relationship Diagram (ERD)</b></summary>

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
</details>

---

## 📁 Folder Structure

A clean, modular folder structure that scales smoothly as the application grows:

```text
TransitOps/
├── components/          # Reusable UI elements (shadcn blocks, layout shells)
├── lib/                 # Shared utility functions, Prisma singleton, API helpers
├── pages/               # Next.js Pages router (UI Routes)
│   ├── api/             # Serverless API routes (auth, analytics, CRUD operations)
│   ├── dashboard.tsx    # Main analytics dashboard
│   ├── fleet.tsx        # Vehicle inventory & health tracking
│   ├── drivers.tsx      # Driver directory & assignment
│   └── ...              # Other feature pages
├── prisma/              # Prisma schema definition, migrations, and seed logic
├── public/              # Static assets (images, fonts, vector icons)
├── styles/              # Global CSS, CSS variables, and Tailwind base directives
├── utils/               # Constants, generic TS types, and helper methods
└── package.json         # Project dependencies, scripts, and package metadata
```

---

## 🚀 Installation & Local Development

Follow these steps to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account (or local PostgreSQL instance)

### 1. Clone the repository

```bash
git clone https://github.com/sachhu04/TransitOps.git
cd TransitOps
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory based on your PostgreSQL/Supabase connection details:

```env
# Connect to Supabase via connection pooling with Supavisor (Port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Direct connection to the database (used specifically by Prisma for migrations)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# JWT Secret for generating secure authentication tokens
JWT_SECRET="your_highly_secure_random_jwt_secret_string_here"
```

> ⚠️ **Warning:** Never commit your `.env` file to version control. Ensure it is included in your `.gitignore`.

### 4. Setup the Database

Push the Prisma schema to your database to create the tables, and generate the Prisma Client for type-safe queries:

```bash
npx prisma db push
npx prisma generate
```

*(Optional)* Seed the database with realistic initial test data:

```bash
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

---

## 🔌 API Overview

The backend uses Next.js serverless API routes (`/pages/api/*`), organized by domain entity. Responses are strongly typed and authenticated.

- **`/api/auth/*`**: Handles secure user login, JWT generation, and session validation.
- **`/api/dashboard/*`**: Aggregates fleet statistics, revenue charts, and operational summaries.
- **`/api/vehicles/*`**: Full CRUD for vehicles, updating health scores and operational statuses.
- **`/api/trips/*`**: Trip creation, dispatch assignments, and lifecycle status updates.
- **`/api/reports/*`**: Endpoints capable of aggregating data for PDF generation.

---

## 🛡️ Security Considerations

Building an enterprise application requires rigorous security standards:

- **Stateless Authentication**: Uses secure HTTP-only configurations for JWTs to prevent XSS attacks while maintaining horizontal scalability.
- **Role-Based Access Control (RBAC)**: Middleware and API endpoints rigorously enforce authorization checks to ensure data segmentation (e.g., Dispatchers cannot view high-level Financial analytics).
- **SQL Injection Protection**: By leveraging Prisma ORM, all database queries are automatically parameterized, neutralizing SQL injection vectors.
- **Password Hashing**: User credentials are encrypted at rest using `bcrypt` hashing algorithms.

---

## 📈 Performance Optimizations

- **Server-Side Rendering (SSR) & Static Site Generation (SSG)**: Intelligent utilization of Next.js rendering strategies to minimize Time to Interactive (TTI).
- **Connection Pooling**: Implementation of Supavisor/PgBouncer via Supabase ensures the database gracefully handles thousands of concurrent serverless connections.
- **Optimistic UI Updates**: Leveraging `swr` (Stale-While-Revalidate) to provide a snappy, immediate interface experience prior to server confirmation.
- **Dynamic Imports**: Heavy components like complex Recharts graphs are dynamically imported to reduce the initial JavaScript payload.

---

## 🔮 Future Improvements

- [ ] **Real-time GPS Tracking**: Integration with WebSockets (or Supabase Realtime) and Mapbox to display live vehicle locations.
- [ ] **Predictive Maintenance**: Machine learning models to predict vehicle failures based on health scores and historical logs.
- [ ] **Mobile Application**: A dedicated React Native companion app for drivers to update trip statuses and upload fuel receipts on the go.
- [ ] **Automated Notifications**: Email and SMS alerts for delayed trips or critical vehicle faults.

---

## 🤝 Contributing

We welcome contributions from the open-source community to make TransitOps even better! 

1. **Fork** the repository.
2. **Create** a new branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. **Open** a Pull Request.

Please ensure your code adheres to the existing ESLint configurations and passes all TypeScript checks.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

<br />
<div align="center">
  <p>Engineered with ❤️ by the TransitOps Team</p>
  <p>
    <a href="https://github.com/sachhu04/TransitOps/stargazers">Star this repository</a> if you find it useful!
  </p>
</div>
