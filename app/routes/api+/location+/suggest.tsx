import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

/**
 * This route is called via `useFetcher` from the Combobox input. It returns a
 * set of languages as the user types. It's called a Resource Route because it
 * doesn't export a component.  You might think of it as an "API Route".
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // First get what the user is searching for by creating a URL:
  // https://developer.mozilla.org/en-US/docs/Web/API/URL
  // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  const url = new URL(request.url)
  const query = url.searchParams.get("q")

  const errorMessage = "No locations found. Please try again."

  if (!query)
    return json({
      items: [],
      error: errorMessage
    })

  // TODO: Use https://developers.google.com/maps/documentation/places/web-service/overview

  const locations = [
    { name: "Witney, UK" },
    { name: "London, UK" },
    { name: "Los Angeles, US" }
  ]

  const matches = locations.filter((location) => {
    return location.name.toLowerCase().includes(query.toLowerCase())
  })

  const result = {
    items: matches,
    error: matches.length === 0 ? errorMessage : undefined
  }

  return json(result, {
    // Add a little bit of caching so when the user backspaces a value in the
    // Combobox, the browser has a local copy of the data and doesn't make a
    // request to the server for it. No need to send a client side data fetching
    // library that caches results in memory, the browser has this ability
    // built-in.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    headers: { "Cache-Control": "max-age=60" }
  })
}
