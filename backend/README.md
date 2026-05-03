# Girlsyle Backend API

A high-performance backend built with Bun, Hono, tRPC, and Drizzle ORM.

## Features
- **tRPC** for type-safe API communication.
- **Hono** for high-performance routing and middleware.
- **Drizzle ORM** with PostgreSQL (Neon/Supabase).
- **UploadThing** for seamless image uploads.
- **JWT Authentication** for secure access to admin procedures.

## Getting Started

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory with the following:
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
UPLOADTHING_TOKEN=your_uploadthing_token
```

On Vercel, add these same variables in **Project Settings -> Environment Variables**.

### 3. Database Setup
```bash
bun run db:push    # Sync schema with database
bun run seed       # Create default admin (admin@example.com / password123)
```

### 4. Run Development Server
```bash
bun run dev        # Starts server on http://localhost:3000
```

## API Reference (tRPC)

All tRPC procedures are accessible under the `/trpc/*` endpoint.

### Admin Procedures (`admin.*`)

| Procedure | Type | Input | Auth | Description |
|-----------|------|-------|------|-------------|
| `login` | Mutation | `{ email, password }` | Public | Authenticates admin and returns a JWT. |
| `register` | Mutation | `{ email, password }` | Public | Registers a new admin. |
| `logout` | Mutation | - | Protected | Logs out (stateless JWT). |
| `getAdmins` | Query | - | Protected | Retrieves a list of all admins. |
| `getAdminById`| Query | `{ id }` | Protected | Retrieves a single admin by ID. |
| `updateAdmin`| Mutation | `{ id, email?, password? }` | Protected | Updates admin details. |
| `deleteAdmin`| Mutation | `{ id }` | Protected | Deletes an admin account.|

### Item Procedures

| Procedure | Type | Input | Auth | Description |
|-----------|------|-------|------|-------------|
| `createItem` | Mutation | `{ name, description, image }` | Protected | Creates a new item in the database. |
| `updateItem` | Mutation | `{ id, name, description, image }` | Protected | Updates an existing item. |
| `deleteItem` | Mutation | `{ id }` | Protected | Deletes an item by ID. |
| `getItems` | Query | - | Public | Retrieves all items. |
| `getItemById`| Query | `{ id }` | Public | Retrieves a single item by ID. |

## Uploading Images (UploadThing)

Handle file uploads via the standard UploadThing endpoint:
`POST /api/uploadthing`

Requires the `Authorization: Bearer <token>` header in the middleware if configured.

## Testing

Run the automated verification script:
```bash
bun run src/test-uploadthing.ts
```
