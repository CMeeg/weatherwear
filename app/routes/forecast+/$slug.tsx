import { defer } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, Await } from "@remix-run/react"
import { Suspense } from "react"
import { Image } from "@unpic/react"
import {
  getForecastWeather,
  getForecastWeatherHourly
} from "~/lib/forecast/weather"
import { createWearForecastApi } from "~/lib/forecast/api.server"
import { createWearForecastCompletionApi } from "~/lib/forecast/completion.server"
import { useForecastCompletionEvent } from "~/lib/forecast/event"
import type { ForecastCompletionEventStatus } from "~/lib/forecast"
import { Cloud } from "~/components/Cloud/Cloud"
import { LinkButton } from "~/components/LinkButton/LinkButton"
import css from "./Forecast.module.css"

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
    fetching_weather: "Getting the weather...",
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

      // Get the weather from the forecast

      return {
        weather: getForecastWeather(completeForecast.weather),
        hourlyWeather: getForecastWeatherHourly(completeForecast.weather),
        text: completeForecast.suggestion?.advice ?? "",
        image_url: completeForecast.imagePath
      }
    })

  return defer({
    weather: getForecastWeather(forecast.weather),
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

  const completionEvent = useForecastCompletionEvent()

  const status = completionEvent?.status ?? "fetching_suggestion"

  const ForecastCompletionStatus = () => {
    return (
      <div className={css.status}>
        <p>{statusMessages[status]}</p>
      </div>
    )
  }

  const ForecastError = () => {
    // TODO: useAsyncError, useful? https://remix.run/docs/en/main/hooks/use-async-error
    // const error = useAsyncError()
    return (
      <div className={css.error}>
        <p>
          <span>{statusMessages["failed"]}</span>
        </p>
        <p>
          <LinkButton to="/">Try again</LinkButton>
        </p>
      </div>
    )
  }

  return (
    <Cloud className="wrapper">
      <div className={css.forecast}>
        <h2>Your forecast</h2>

        {/* TODO: Fix error - This Suspense boundary received an update before it finished hydrating. */}
        {/* https://github.com/remix-run/remix/issues/5165
      https://github.com/remix-run/remix/issues/5153
      https://github.com/remix-run/remix/issues/5760
      https://github.com/remix-run/remix/issues/4822
      https://github.com/kiliman/remix-hydration-fix
      https://github.com/Xiphe/remix-island */}
        <Suspense fallback={<ForecastCompletionStatus />}>
          <Await resolve={completion} errorElement={<ForecastError />}>
            {(forecast) => (
              <div className={css.completion}>
                <div className={css.weather}>
                  <p>{forecast.text}</p>
                </div>

                <div className={css.hourly}>
                  <div
                    className="table-wrapper"
                    role="group"
                    aria-labelledby="content"
                  >
                    <table>
                      <thead>
                        <tr>
                          <th></th>
                          {forecast.hourlyWeather.map((hourly) => (
                            <th key={hourly.time} scope="col">
                              {hourly.time}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Weather</th>
                          {forecast.hourlyWeather.map((hourly) => (
                            <td key={hourly.time}>
                              <span title={hourly.weather_description ?? ""}>
                                {hourly.weather_symbol}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" title="Temperature (Celcius)">
                            Temperature
                          </th>
                          {forecast.hourlyWeather.map((hourly) => (
                            <td key={hourly.time}>{`${hourly.temp_c}°C`}</td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row">Chance of rain</th>
                          {forecast.hourlyWeather.map((hourly) => (
                            <td
                              key={hourly.time}
                            >{`${hourly.chance_of_rain}%`}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {forecast.image_url && (
                  <div className={css.image}>
                    <Image
                      src={forecast.image_url}
                      width={1024}
                      height={1024}
                      alt=""
                      // priority={true}
                    />
                  </div>
                )}

                <div className={css.options}>
                  <LinkButton to="/">Request another forecast</LinkButton>
                </div>
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </Cloud>
  )
}
