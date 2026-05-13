# Mac Admin Panel

An admin control panel for the Smart Mac / Mac Bot Discord bot, built with SvelteKit 2 and Tailwind CSS.

## Tech Stack

- **Authentication**: [PocketBase](https://pocketbase.io/) OAuth2 (Discord provider). Access is restricted to approved bot admin Discord accounts via `ADMIN_DISCORD_USER_IDS`.
- **Read-only database**: Drizzle ORM with PostgreSQL (badmovies.co archive — schema in `src/types/schema.ts`, client in `src/lib/badmovies-db.ts`)
- **Bot data**: PocketBase collections (wheel, conversations, usage logs, etc.)
- **Backend API**: SvelteKit server functions handle bot config, logs, and admin CRUD operations.

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
