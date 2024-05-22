import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { forecast, city } from "~/db/schema"

const connectionString = process.env.DATABASE_URL ?? ""

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })

// TODO: Consider using [remember](https://github.com/epicweb-dev/remember/)
// TODO: Look at drizzle logging - anything similar to [prisma logging](https://github.com/epicweb-dev/epic-stack/blob/main/app/utils/db.server.ts)? See https://orm.drizzle.team/docs/goodies#logging
const db = drizzle(client)

type DbClient = typeof db

// TODO: Not happy with this - it's a bit cumbersome to work with and I only have one schema
const dbSchema = {
  public: {
    forecast,
    city
  }
}

export { db, dbSchema }

export type { DbClient }
