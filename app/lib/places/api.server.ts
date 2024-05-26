import { eq, ilike, or } from "drizzle-orm"
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
          return result.ok(city[0])
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
        const cities = await db
          .select()
          .from(dbSchema.public.city)
          .where(
            or(
              ilike(dbSchema.public.city.name, `%${term}%`),
              ilike(dbSchema.public.city.unaccentedName, `%${term}%`),
              ilike(dbSchema.public.city.displayName, `%${term}%`)
            )
          )
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
