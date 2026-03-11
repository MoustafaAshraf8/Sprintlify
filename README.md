# Sprintlify

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
