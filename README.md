# Mac Admin Panel

An admin control panel for the Smart Mac / Mac Bot Discord bot, built with SvelteKit 2 and Tailwind CSS.

## Current Status: Frontend Scaffold Only

This project is currently in the **UI Scaffolding Phase**. 

**Important Notes:**
- Authentication, API routing, and database connections are **NOT** wired up yet.
- The app uses completely mock data (located in `src/lib/mock/admin.ts`).
- All buttons and actions are non-functional placeholders.
- No real secrets or API keys are used in the codebase.
- The `DATABASE_URL` check is satisfied by placeholder values in `.env` for local development.

## Future Plans

- **Authentication**: Will be handled by [Better Auth](https://better-auth.com/) using **Discord OAuth ONLY**. Access will be restricted to approved bot admin Discord accounts. There will be no email/password or other social logins.
- **Database**: Drizzle ORM with PostgreSQL.
- **Backend API**: SvelteKit server functions will handle bot config synchronization, logs, and database CRUD.

## Getting Started Locally

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file to satisfy any library checks during scaffolding:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:5173` to explore the admin dashboard.

## Project Structure

- `src/lib/components/`: Reusable UI components (Sidebar, Topbar, StatCard, etc.)
- `src/lib/mock/`: Mock data files for the UI scaffold
- `src/routes/`: SvelteKit pages matching the dashboard navigation
- `src/routes/login/`: Placeholder Discord login UI
