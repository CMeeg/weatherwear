import { eq, ilike } from "drizzle-orm"
import { result } from "~/lib/core"
import type { FuncResult, Nullable } from "~/lib/core"
import { db, dbSchema } from "~/db/client.server"
import type { City } from "~/lib/places"

const createPlacesApi = () => {
  return {
    fetchCity: async (id: string): Promise<FuncResult<Nullable<City>>> => {
      try {
        const city = await db
          .select()
          .from(dbSchema.public.city)
          .where(eq(dbSchema.public.city.id, id))

        if (city.length > 0) {
          return result.ok(city[0]!)
        }

        return result.ok(null)
      } catch (error) {
        // TODO: TypeScript erorrs!
        const message = error instanceof Error ? error.message : "Unknown error"

        return result.error(new Error(message, { cause: error }))
      }
    },
    searchCities: async (term: string): Promise<FuncResult<City[]>> => {
      try {
        /*TODO:
        - `ilike` is not going to give great results - try `fuzzystrmatch` (https://neon.tech/docs/extensions/pg-extensions) or `pg_trgm` (https://neon.tech/docs/extensions/pg_trgm)
        - Will maybe need to normalize the search term and the city names - try `normalize` (https://www.postgresql.org/docs/13/functions-string.html#id-1.5.8.10.5.2.2.7.1.1.1) or `unaccent` (https://www.postgresql.org/docs/16/unaccent.html)
        */
        const cities = await db
          .select()
          .from(dbSchema.public.city)
          .where(ilike(dbSchema.public.city.name, `%${term}%`))
          .limit(10)

        return result.ok(cities)
      } catch (error) {
        // TODO: TypeScript erorrs!
        const message = error instanceof Error ? error.message : "Unknown error"

        return result.error(new Error(message, { cause: error }))
      }
    }
  }
}

export { createPlacesApi }
