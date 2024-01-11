import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { forecast } from "../../../db/schema"

const connectionString = process.env.SUPABASE_DB_URL ?? ""

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })

// TODO: Consider using [remember](https://github.com/epicweb-dev/remember/)
// TODO: Look at drizzle logging - anything similar to [prisma logging](https://github.com/epicweb-dev/epic-stack/blob/main/app/utils/db.server.ts)?
const db = drizzle(client)

type DbClient = typeof db

const dbSchema = {
  public: {
    forecast
  }
}

export { db, dbSchema }

export type { DbClient }
