import { defer } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, Await } from "@remix-run/react"
import { Suspense } from "react"
import { createWearApi } from "~/lib/wear/api.server"
import { createWeatherApi } from "~/lib/weather/api.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const submissionData = new URL(request.url).searchParams

  const submission = {
    location: submissionData.get("location"),
    style: submissionData.get("style"),
    fit: submissionData.get("fit"),
    subject: submissionData.get("subject")
  }

  // TODO: Form validation
  if (
    !submission.location ||
    !submission.style ||
    !submission.fit ||
    !submission.subject
  ) {
    // TODO: Return validation errors
    throw new Response("Invalid submission.", { status: 500 })
  }

  const weatherApi = createWeatherApi()

  const wearApi = createWearApi({
    openAiApiKey: import.meta.env.OPENAI_API_KEY
  })

  const location = submission.location
  const profile = {
    style: submission.style,
    fit: submission.fit,
    subject: submission.subject
  }

  const response = {
    text: "",
    image_url: ""
  }

  const weatherWear = weatherApi
    .fetchForecast(location)
    .then(([forecast, forecastError]) => {
      if (forecastError) {
        // TODO: Deal with error
        throw new Error(forecastError.message)
      }

      // TODO: Check weather data `nearest_area` array and if more than one item allow the user to choose which one they want to use

      console.log(forecast)

      return wearApi.fetchSuggestions(profile, forecast)
    })
    .then(([suggestions, suggestionsError]) => {
      if (suggestionsError) {
        // TODO: Deal with error
        throw new Error(suggestionsError.message)
      }

      response.text = suggestions

      return wearApi.generateImageFromSuggestions(profile, suggestions)
    })
    .then(([imageUrl, imageError]) => {
      if (imageError) {
        // TODO: Deal with error
        throw new Error(imageError.message)
      }

      response.image_url = imageUrl

      return response
    })
    .catch((error) => {
      // TODO: Is this how we should be handling errors?
      throw new Response(error.message, { status: 500 })
    })

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
      https://remix.run/docs/en/main/guides/streaming */}

      <Suspense fallback={<p>Getting forecast...</p>}>
        <Await resolve={weatherWear}>
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
