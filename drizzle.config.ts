import dotenv from "dotenv"
import type { Config } from "drizzle-kit"

dotenv.config()
dotenv.config({ path: `.env.local`, override: true })

export default {
  schema: "./app/db/schema.ts",
  out: "./app/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? ""
  }
} satisfies Config
