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

  cities.map((city) => {
    // TODO: Add `display_name` column to the city table and use it here
    const name = [city.name]

    if (city.state) {
      name.push(city.state)
    }

    name.push(city.country)

    locations.push({
      id: city.id,
      name: name.join(", ")
    })
  })

  const result = {
    items: locations,
    error:
      locations.length === 0
        ? "No locations found. Please try a different search."
        : undefined
  }

  return json(result, {
    // Add a little bit of caching so when the user backspaces a value in the input the browser has a local copy of the data and doesn't make a request to the server for it
    headers: { "Cache-Control": "max-age=60" }
  })
}
