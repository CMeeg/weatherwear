import { useLocation } from "@remix-run/react"
import { useEventSource } from "remix-utils/sse/react"
import type { ForecastCompletionEvent } from "~/lib/forecast"
import type { Nullable } from "~/lib/core"

const useForecastCompletionEvent = (): Nullable<ForecastCompletionEvent> => {
  const location = useLocation()

  const status = useEventSource("/forecast/completion", {
    event: "status"
  })

  if (!status) {
    return null
  }

  // TODO: Use zod here
  const completionEvent = JSON.parse(status ?? "{}") as ForecastCompletionEvent

  if (location.pathname !== `/forecast/${completionEvent.urlSlug}`) {
    return null
  }

  return completionEvent
}

export { useForecastCompletionEvent }
