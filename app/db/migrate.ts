import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

dotenv.config()
dotenv.config({ path: `.env.local`, override: true })

const connectionString = process.env.SUPABASE_DB_URL ?? ""

const sql = postgres(connectionString, { max: 1 })

const db = drizzle(sql)

await migrate(db, { migrationsFolder: "./db/migrations" })

await sql.end()
