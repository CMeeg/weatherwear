import { defer } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, Await } from "@remix-run/react"
import { Suspense } from "react"
import { useEventSource } from "remix-utils/sse/react"
import { createWearForecastApi } from "~/lib/forecast/api.server"
import { createWearForecastCompletionApi } from "~/lib/forecast/completion.server"
import type { ForecastCompletionEventStatus } from "~/lib/forecast/completion.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // Validate params
  const { slug } = params

  if (!slug) {
    // TODO: Need to read up on 404s, error boundaries etc
    throw new Response("Forecast not found.", { status: 404 })
  }

  // Fetch the forecast

  const forecastApi = createWearForecastApi()

  const [forecast, forecastError] =
    await forecastApi.fetchForecastFromSlug(slug)

  if (forecastError) {
    // TODO: Need to read up on 404s, error boundaries etc
    throw new Response("Error fetching forecast.", { status: 500 })
  }

  if (!forecast) {
    // TODO: Need to read up on 404s, error boundaries etc
    throw new Response("Forecast not found.", { status: 404 })
  }

  // Complete the forecast and return the result

  const forecastCompletionApi = createWearForecastCompletionApi(forecastApi)

  // TODO: If the forecast is already complete then there is no need to defer
  // if (forecastCompletionApi.isComplete(forecast)) {
  // }

  const weatherWear = forecastCompletionApi
    .completeForecast(forecast)
    .then((completionResult) => {
      const [completeForecast, completionError] = completionResult

      if (completionError) {
        // TODO: Error handling
        throw new Error("Error completing forecast.")
      }

      return {
        text: completeForecast.suggestion?.advice ?? "",
        image_url: forecastApi.getForecastImageUrl(completeForecast)
      }
    })

  const statusMessages: Record<ForecastCompletionEventStatus, string> = {
    fetching_suggestion: "Considering your options...",
    generating_image: "Creating your look...",
    completed: "All done!",
    failed: "Something went wrong. How embarrassing."
  }

  return defer({
    slug: forecast.url_slug,
    statusMessages,
    weatherWear
  })
}

export const meta: MetaFunction = () => {
  // TODO: Use loader data here
  return [
    { title: "WeatherWear" },
    {
      name: "description",
      content: "Let me tell you what to wear today based on your local weather."
    }
  ]
}

export default function Index() {
  const { slug, statusMessages, weatherWear } = useLoaderData<typeof loader>()

  const status = useEventSource(`/forecast/completion/${slug}`, {
    event: "status"
  })

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Your forecast for today</h1>

      <Suspense
        fallback={
          <p>
            {statusMessages[status as ForecastCompletionEventStatus] ??
              statusMessages["fetching_suggestion"]}
          </p>
        }
      >
        <Await
          resolve={weatherWear}
          errorElement={<p>{statusMessages["failed"]}</p>}
        >
          {(weatherWear) => (
            <p>
              {/* TODO: Is there an image component I can use here */}
              {weatherWear.image_url && (
                <img
                  src={`${weatherWear.image_url}?width=1024&quality=80`}
                  alt=""
                  style={{ height: "80vh" }}
                />
              )}
              <br />
              {weatherWear.text}
            </p>
          )}
        </Await>
      </Suspense>
    </div>
  )
}
