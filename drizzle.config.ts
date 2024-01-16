import "dotenv/config"
import type { Config } from "drizzle-kit"

export default {
  schema: "./app/db/schema.ts",
  out: "./app/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL ?? ""
  }
} satisfies Config
