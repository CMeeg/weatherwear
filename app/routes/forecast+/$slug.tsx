import { defer } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, Await } from "@remix-run/react"
import { Suspense } from "react"
import {
  fetchWearForecastFromSlug,
  updateWearForecast
} from "~/lib/wear/db.server"
import type { WearForecast } from "~/lib/wear"
import { createWearApi } from "~/lib/wear/api.server"
import type { WeatherForecast } from "~/lib/weather"

const completeWearForecast = async (wearForecast: WearForecast) => {
  try {
    const response = {
      text: "",
      image_url: ""
    }

    if (!wearForecast.suggestion || !wearForecast.image_id) {
      const wearApi = createWearApi({
        openAiApiKey: process.env.OPENAI_API_KEY ?? ""
      })

      if (!wearForecast.suggestion) {
        // Fetch the wear suggestion and update the wear forecast

        const [suggestion, suggestionError] = await wearApi.fetchSuggestion(
          wearForecast.profile,
          // TODO: Need to get this typed properly
          wearForecast.weather as WeatherForecast
        )

        if (suggestionError) {
          // TODO: Deal with error
          throw new Error(suggestionError.message)
        }

        wearForecast.suggestion = suggestion
        wearForecast = await updateWearForecast(wearForecast)
      }

      if (wearForecast.suggestion && !wearForecast.image_id) {
        const [imageUrl, imageError] =
          await wearApi.generateImageFromSuggestion(
            wearForecast.profile,
            wearForecast.suggestion
          )

        if (imageError) {
          // TODO: Deal with error
          throw new Error(imageError.message)
        }

        // TODO: When the image is going into Supabase we need to remove this and update the image_id instead, then return a URL to the image on Supabase
        response.image_url = imageUrl
      }
    }

    response.text = wearForecast.suggestion?.advice ?? ""

    return response
  } catch (error) {
    const err = error as Error
    // TODO: Is this how we should be handling errors?
    throw new Response(err.message, { status: 500 })
  }
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params

  if (!slug) {
    // TODO: Need to read up on 404s, error boundaries etc
    throw new Response("Forecast not found.", { status: 404 })
  }

  const wearForecast = await fetchWearForecastFromSlug(slug)

  if (!wearForecast) {
    // TODO: Need to read up on 404s, error boundaries etc
    throw new Response("Forecast not found.", { status: 404 })
  }

  // TODO: If the forecast is already complete then there is no need to defer

  const weatherWear = completeWearForecast(wearForecast)

  return defer({
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
  const { weatherWear } = useLoaderData<typeof loader>()

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Your forecast for today</h1>

      {/* TODO: Stream results:
      https://www.jacobparis.com/content/remix-defer-streaming-progress
      https://remix.run/docs/en/main/guides/streaming
      Need to take a look at Supabase real-time also */}

      <Suspense fallback={<p>Getting forecast...</p>}>
        <Await
          resolve={weatherWear}
          errorElement={
            <p>Sorry, there was an error fetching your forecast.</p>
          }
        >
          {(weatherWear) => (
            <p>
              {weatherWear.image_url && (
                <img
                  src={weatherWear.image_url}
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
