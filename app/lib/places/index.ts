import type { FormListItem } from "~/lib/forms"
import { city } from "~/db/schema"

type City = typeof city.$inferSelect

interface LocationsApiResponse {
  items: FormListItem[]
  error?: string
}

export type { City, LocationsApiResponse }
