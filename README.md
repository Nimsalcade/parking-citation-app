# Parking Citation Issuer System

A full-stack Ticket Citation Issuer solution designed for parking enforcement teams. It allows officers to issue citations, manage violation records, monitor performance metrics, and generate printable PDF tickets.

## Features

- **Dashboard Overview** – Surface total tickets, unpaid amounts, collection totals, and violation counts at a glance.
- **Citation Lifecycle Management** – Create new citations, update statuses (`issued`, `paid`, `void`), and review recent activity.
- **Printable Tickets** – Generate PDF citations on demand through the `/api/print` endpoint powered by PDFKit.
- **Seeded Reference Data** – Officers, vehicles, violations, and sample citations are auto-populated for instant demos.

## Tech Stack

- Next.js 15 App Router
- React 19 + Tailwind CSS 4
- Drizzle ORM with Better-SQLite3
- SWR for client-side data fetching
- Zod for input validation
- PDFKit for ticket generation

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the application.

### Database & Seeding

The server seeds SQLite automatically on first load. To reseed manually:

```bash
curl -X POST http://localhost:3000/api/seed
```

### Quality Gates

- `npm run lint` – Next.js & ESLint checks
- `npm run build` – Production build verification

## Project Structure

- `src/app` – App Router routes, UI components, API endpoints
- `src/db` – Drizzle schema definitions and database utilities
- `src/server` – Server actions, PDF generation, seeding helpers
- `data/app.db` – SQLite database file (ignored by Git)

## Deployment Notes

- Requires Node.js 20+ (per Next.js 15 requirements)
- Ensure the `/data` directory is writable by the deployment environment for SQLite persistence
