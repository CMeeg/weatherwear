import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { defaultLocale } from "~/lib/i18n"
import type { LocationItem } from "~/lib/places"

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

  // TODO: Need to add [Google logo](https://developers.google.com/maps/documentation/places/web-service/policies#logo) when showing response

  // Fetch places from the Google Places Autocomplete API
  // https://developers.google.com/maps/documentation/places/web-service/autocomplete

  const placesUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  )

  placesUrl.search = new URLSearchParams({
    input: query,
    language: defaultLocale.culture,
    types: "(cities)",
    key: process.env.GOOGLE_MAPS_API_KEY ?? ""
  }).toString()

  const locations: LocationItem[] = []

  try {
    const placesResponse = await fetch(placesUrl.toString())

    if (!placesResponse.ok) {
      throw new Error("Failed to fetch places.")
    }

    const places =
      (await placesResponse.json()) as google.maps.places.AutocompleteResponse

    places.predictions.map((prediction) => {
      locations.push({
        id: prediction.place_id,
        name: prediction.description
      })
    })
  } catch (error) {
    return json({
      items: undefined,
      error: "There was a problem fetching locations. Please try again."
    })
  }

  // Return the locations data

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
