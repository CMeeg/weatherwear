import type { LoaderFunctionArgs } from "@remix-run/node"
import { eventStream } from "remix-utils/sse/server"
import { forecastCompletionEventEmitter } from "~/lib/forecast/completion.server"
import type { ForecastCompletionEvent } from "~/lib/forecast/completion.server"

export async function loader({ request }: LoaderFunctionArgs) {
  // Return an event stream to emit forecast completion events

  return eventStream(request.signal, function setup(send) {
    async function handle(completionEvent: ForecastCompletionEvent) {
      // Provide a status update

      send({ event: "status", data: JSON.stringify(completionEvent) })
    }

    forecastCompletionEventEmitter.on(handle)

    return function clear() {
      forecastCompletionEventEmitter.off(handle)
    }
  })
}
