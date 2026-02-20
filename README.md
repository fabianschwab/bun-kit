# Bun-Kit

A SvelteKit project powered by Bun runtime with authentication and database integration.

## Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)
- or Node.js 18+ (for compatibility)

## Getting Started

### 1. Install Dependencies

Install all project dependencies using Bun:

```bash
bun install
```

### 2. Environment Configuration

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```env
# Drizzle Database
DATABASE_URL=local.db

# Application Origin (e.g., http://localhost:5173 for development)
ORIGIN="http://localhost:5173"

# Better Auth Secret
# For production, use 32 characters generated with high entropy
# Generate one at: https://www.better-auth.com/docs/installation
BETTER_AUTH_SECRET="your-secret-key-here"

# IBM AppID OAuth (Optional) - https://cloud.ibm.com/docs/appid?topic=appid-getting-started
```

**Important:**

- Generate a secure `BETTER_AUTH_SECRET` for production (32+ characters with high entropy)
- Set `ORIGIN` to your application URL
- OAuth credentials are optional but required for authenticated routes

### 3. Database Setup

Initialize and push the database schema:

```bash
bun run db:push
```

Optional: Generate auth schema if needed:

```bash
bun run auth:schema
```

### 4. Start Development Server

Run the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Run type checking
- `bun run lint` - Lint code
- `bun run format` - Format code with Prettier
- `bun run db:push` - Push database schema changes
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio (database GUI)
- `bun run auth:schema` - Generate Better Auth schema

## Tech Stack

- **Runtime:** Bun
- **Framework:** SvelteKit 2
- **UI:** Svelte 5, TailwindCSS 4, Carbon Components
- **Authentication:** Better Auth
- **Database:** Drizzle ORM with SQLite
- **Language:** TypeScript

## Project Structure

```
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── rpc/           # Remote procedure calls
│   │   └── server/        # Server-side code
│   │       ├── db/        # Database schemas and config
│   │       └── auth.ts    # Authentication setup
│   └── routes/            # SvelteKit routes
├── static/                # Static assets
└── .env                   # Environment variables (create from .env.example)
```

## Troubleshooting

### Database Issues

If you encounter database errors, try:

```bash
rm local.db
bun run db:push
```

### Port Already in Use

If port 5173 is already in use, you can specify a different port:

```bash
bun run dev -- --port 3000
```
