import { json } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { eventStream } from "remix-utils/sse/server"
import { createWearForecastApi } from "~/lib/forecast/api.server"
import { forecastCompletionEventEmitter } from "~/lib/forecast/completion.server"
import type { ForecastCompletionEvent } from "~/lib/forecast/completion.server"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { slug } = params

  // Fetch the forecast to validate that it exists

  if (!slug) {
    throw json("Forecast not found.", { status: 404 })
  }

  const forecastApi = createWearForecastApi()

  const [forecast, forecastError] =
    await forecastApi.fetchForecastFromSlug(slug)

  if (forecastError) {
    throw json("Error fetching forecast.", { status: 500 })
  }

  if (!forecast) {
    throw json("Forecast not found.", { status: 404 })
  }

  // Return an event stream to emit forecast completion events

  return eventStream(request.signal, function setup(send) {
    async function handle(completionEvent: ForecastCompletionEvent) {
      if (completionEvent.urlSlug !== params.slug) {
        // We don't care about this event

        return
      }

      // Provide a status update

      send({ event: "status", data: completionEvent.status })
    }

    forecastCompletionEventEmitter.on(handle)

    return function clear() {
      forecastCompletionEventEmitter.off(handle)
    }
  })
}
