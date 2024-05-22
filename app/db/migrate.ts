import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

dotenv.config()

const connectionString = process.env.DATABASE_URL ?? ""

const client = postgres(connectionString, { max: 1 })

const db = drizzle(client)

await migrate(db, { migrationsFolder: "./app/db/migrations" })

await client.end()
