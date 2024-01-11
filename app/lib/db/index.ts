import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { forecast } from "../../../db/schema"

// TODO: [Connection pooling](https://orm.drizzle.team/docs/get-started-postgresql#supabase)

type DbClient = ReturnType<typeof drizzle>

let supabaseDb: DbClient

const createDbClient = (connectionString: string) => {
  if (!supabaseDb) {
    const client = postgres(connectionString, { prepare: false })
    supabaseDb = drizzle(client)
  }

  return supabaseDb
}

export { createDbClient, forecast }

export type { DbClient }
