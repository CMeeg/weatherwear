import { useRouteLoaderData } from "@remix-run/react"
import type { loader as forecastLoader } from "~/routes/forecast+/$slug"
import { getWeatherIconUrl, weatherCodename } from "~/lib/weather"

const useForecastWeather = () => {
  const loaderData = useRouteLoaderData<typeof forecastLoader>(
    "routes/forecast+/$slug"
  )

  let weather = loaderData?.weather

  if (!weather) {
    const defaultWeatherCodename = weatherCodename.sunny

    weather = {
      codename: defaultWeatherCodename,
      icon_url: getWeatherIconUrl(defaultWeatherCodename)
    }
  }

  return weather
}

export { useForecastWeather }
