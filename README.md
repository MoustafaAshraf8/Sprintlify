# Sprintlify

Sprintlify is a sprint-based project planning, allowing project owners to organize tickets into fixed time periods and track progress across the team.

### How it works

Project owners can create sprints with a defined start and end date (between 1 and 90 days). Tickets are assigned to sprints by project members, and unassigned tickets live in the project backlog. Each project can only have one active sprint at a time.

### Sprint lifecycle

A sprint follows a strict one-way state machine:

```
planned → active → completed
```

- **Planned** — sprint is created and tickets can be assigned to it
- **Active** — sprint has started, work is in progress
- **Completed** — owner marks the sprint as complete, unfinished tickets automatically return to the backlog

### Sprint report

When the project owner completes a sprint, a report is generated and cached. It includes:

- Total tickets vs completed tickets and completion rate
- Breakdown by priority — critical, high, medium, low
- Breakdown by label — bug, feature, infra, docs, security, perf
- List of uncompleted tickets carried over to the backlog

### Backlog

The backlog is the pool of unplanned tickets — any ticket with no sprint assigned. Tickets land in the backlog when they are first created, manually removed from a sprint, or automatically moved back when a sprint is completed with unfinished work.

## Features

- JWT authentication with stateful refresh tokens and reuse detection
- Project management with role-based membership
- Admin and member access levels
- Cache layer using Cloudflare KV service
- Ticket tracking with priority, status, labels, and assignees
- Ticket filtering, search, and pagination
- Ticket history — full audit log of every field change
- Comments on tickets

## Tech Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Runtime    | Cloudflare Workers    |
| Framework  | Hono                  |
| Database   | Supabase (PostgreSQL) |
| ORM        | Drizzle ORM           |
| Cache      | Cloudflare KV         |
| Validation | Zod                   |
| Auth       | JWT + bcryptjs        |

### 1. Clone the repository

```
git clone https://github.com/MoustafaAshraf8/Sprintlify.git
```

### 2. Create project secrets

Create a `.env` in the project root directory, and add these secrets to it:

```
SUPABASE_URL=
SUPABASE_DB_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
JWT_REFRESH_SECRET=
```

You can acquire these secrets values from: </br>
a- Supabase secrets

```
Supabase status
```

b- JWT secrets

```bash
# JWT
openssl rand -hex 64
# refresh JWT
openssl rand -hex 64
```

### 3. Start the Database

Supabase require [Docker](https://www.docker.com/) to be installed and then started by running this command in the project root directory:

```
supabase start
```

### 4. Push database migrations

```
npm run supabase:migrate-local
```

### 5. Generate database types

```
npm run supabase:update-types-local
npm run drizzle:introspect-local
```

### 6. Run development server

```
npm run dev
```

### 7. Access your server at:

`http://127.0.0.1:8787`
