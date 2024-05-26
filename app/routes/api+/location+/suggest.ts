import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { createPlacesApi } from "~/lib/places/api.server"
import type { FormListItem } from "~/lib/forms"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the query from the URL

  const url = new URL(request.url)
  const query = url.searchParams.get("q")

  if (!query) {
    return json({
      items: undefined,
      error: "Please enter a location to search for."
    })
  }

  // Search for cities in the db

  const [cities, citiesError] = await createPlacesApi().searchCities(query)

  if (citiesError) {
    return json({
      items: undefined,
      error: "There was a problem fetching locations. Please try again."
    })
  }

  // Return the locations data

  const locations: FormListItem[] = []

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i]

    locations.push({
      id: city.id,
      name: city.displayName
    })
  }

  const result = {
    items: locations,
    error:
      locations.length === 0
        ? "No locations found. Please try a different search."
        : undefined
  }

  return json(result, {
    // Responses can be cached because the data is coming directly from the db and does not change frequently, if at all
    headers: { "Cache-Control": "max-age=3600" }
  })
}
