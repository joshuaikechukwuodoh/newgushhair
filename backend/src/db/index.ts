import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set in environment variables!");
}

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech") ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(client, { schema });
