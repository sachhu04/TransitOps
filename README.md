# TransitOps 🚌

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-FCC72C?logo=vitest)](https://vitest.dev/)
[![CI/CD](https://github.com/sachhu04/TransitOps/actions/workflows/ci.yml/badge.svg)](https://github.com/sachhu04/TransitOps/actions)

**TransitOps** is a modern, production-grade Fleet Management System built to handle real-time vehicle tracking, driver assignments, and advanced financial analytics. Engineered with a focus on performance, robust architecture, and enterprise-level security.

*(Insert a screenshot of the dashboard here)*

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Secure JWT authentication with strict authorization boundaries separating `ADMIN`, `DISPATCHER`, and `DRIVER` roles.
- **Real-Time Analytics Engine:** Live dashboards visualizing 7-day rolling revenue vs. operational costs and dynamic fleet utilization ratios using `Recharts`.
- **Advanced State Management:** Utilizes `SWR` for real-time data fetching, caching, and optimistic UI updates.
- **Enterprise-Grade CI/CD:** Fully automated GitHub Actions pipeline enforcing strict ESLint rules, TypeScript type-checking, and passing Vitest test suites on every commit.
- **Modern UI/UX:** Responsive, glassmorphism-inspired UI built with Tailwind CSS, Shadcn UI, and Lucide Icons.

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router paradigm in Pages), React 18, Tailwind CSS |
| **Backend** | Next.js API Routes (Node.js/Edge) |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication**| Custom JWT-based stateless auth |
| **Testing** | Vitest, React Testing Library, jsdom |
| **Tooling** | Prettier, ESLint, GitHub Actions (CI/CD) |

## 🧪 Testing & CI/CD Strategy

Quality and reliability are first-class citizens in this project.
- **Unit Testing:** Critical utility functions and authentication helpers are heavily tested using `Vitest`. (12 comprehensive tests validating core business logic).
- **Automated Pipeline:** The `.github/workflows/ci.yml` pipeline ensures that absolutely no code is merged unless it passes formatting (`Prettier`), linting (`ESLint`), static analysis (`tsc`), unit tests (`Vitest`), and a full production build (`next build`).

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- PostgreSQL (running locally or via a cloud provider)

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

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your connection strings:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/transitops"
   JWT_SECRET="your_super_secret_jwt_key_here"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed the database with mock data
   npm run seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sachhu04/TransitOps/issues).

---
*Designed & Engineered by Sachin Singh*
