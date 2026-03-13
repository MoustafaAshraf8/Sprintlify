# Sprintlify

Sprintlify is a team ticket management REST API built for developer teams to organize projects, track issues, and collaborate efficiently.

Built with **Hono** on **Cloudflare Workers**, backed by **Supabase** (PostgreSQL) and **Drizzle ORM**.

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
