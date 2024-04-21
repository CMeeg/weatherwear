import { defer } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, useLocation, Await } from "@remix-run/react"
import { Suspense } from "react"
import { useEventSource } from "remix-utils/sse/react"
import { createWearForecastApi } from "~/lib/forecast/api.server"
import { createWearForecastCompletionApi } from "~/lib/forecast/completion.server"
import type { ForecastCompletionEventStatus } from "~/lib/forecast/completion.server"
import { Image } from "@unpic/react"

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

  // Get the status messages

  // TODO: Put these somewhere else
  const statusMessages: Record<ForecastCompletionEventStatus, string> = {
    fetching_suggestion: "Considering your options...",
    generating_image: "Creating your look...",
    completed: "All done!",
    failed: "Something went wrong. How embarrassing."
  }

  // Complete the forecast and return the result

  const forecastCompletionApi = createWearForecastCompletionApi(forecastApi)

  const completion = forecastCompletionApi
    .completeForecast(forecast)
    .then((completionResult) => {
      const [completeForecast, completionError] = completionResult

      if (completionError) {
        // TODO: Error handling
        console.error(completionError)
        throw new Error("Error completing forecast.")
      }

      return {
        text: completeForecast.suggestion?.advice ?? "",
        image_url: completeForecast.imagePath
      }
    })

  return defer({
    statusMessages,
    completion
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
  const { statusMessages, completion } = useLoaderData<typeof loader>()

  const location = useLocation()

  const status = useEventSource(`${location.pathname}/completion`, {
    event: "status"
  })

  const ForecastError = () => {
    // TODO: useAsyncError, useful? https://remix.run/docs/en/main/hooks/use-async-error
    // const error = useAsyncError()
    return <p>{statusMessages["failed"]}</p>
  }

  return (
    <>
      <h2>Your forecast for today</h2>

      {/* TODO: Fix error - This Suspense boundary received an update before it finished hydrating. */}
      {/* https://github.com/remix-run/remix/issues/5165
      https://github.com/remix-run/remix/issues/5153
      https://github.com/remix-run/remix/issues/5760
      https://github.com/remix-run/remix/issues/4822
      https://github.com/kiliman/remix-hydration-fix
      https://github.com/Xiphe/remix-island */}
      <Suspense
        fallback={
          <p>
            {statusMessages[status as ForecastCompletionEventStatus] ??
              statusMessages["fetching_suggestion"]}
          </p>
        }
      >
        <Await resolve={completion} errorElement={<ForecastError />}>
          {(forecast) => (
            <>
              <p>{forecast.text}</p>
              {/* TODO: Is there an image component I can use here */}
              {forecast.image_url && (
                // <img
                //   src={`${resolved.image_url}?tr=w-640&h-640&fm-auto`}
                //   alt=""
                //   style={{ height: "80vh" }}
                // />
                <Image
                  src={forecast.image_url}
                  width={1024}
                  height={1024}
                  alt=""
                  // priority={true}
                />
              )}
            </>
          )}
        </Await>
      </Suspense>
    </>
  )
}
