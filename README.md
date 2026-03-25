# Bun-Kit

No bloat project powered by Bun runtime.

## Tech Stack

- **Runtime:** Bun
- **Framework:** SvelteKit
- **UI:** Svelte, TailwindCSS 4, IBM Carbon Components
- **Authentication:** Better Auth
- **Database:** Drizzle ORM with POstgreSQL
- **Language:** TypeScript

## Prerequisites

Only one thing needed

- [Bun](https://bun.com/) (latest version recommended)

## Start Developing

1. Install all project dependencies using Bun:

```bash
bun install
```

2. Configure your `.env` file from the example template:

```bash
cp .env.example .env
```

3. Run development server

```bash
bun run dev
```

Have fun developing

## Database

No Database available, no problem. Just run

```bash
podman compose up -d # start the PostgreSQL database
podman compose down # stop the database
```

and use this connection string in your `env` file:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app
```
