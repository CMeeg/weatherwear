import type { FormListItem } from "~/lib/forms"

interface LocationsApiResponse {
  items: FormListItem[]
  error?: string
}

export type { LocationsApiResponse }
