import { useRouteLoaderData } from "@remix-run/react"
import type { loader as forecastLoader } from "~/routes/forecast+/$slug"
import {
  getWeatherIconUrl,
  weatherId,
  weatherTheme,
  weatherSymbol
} from "~/lib/weather"
import { useForecastCompletionEvent } from "~/lib/forecast/event"
import type { WeatherCodename, WeatherForecast } from "~/lib/weather"
import type { Nullable } from "~/lib/core"

interface ForecastWeather {
  codename: WeatherCodename
  icon_url: string
  theme: string
}

interface ForecastWeatherHourlySummary {
  time: string
  chance_of_rain: number
  temp_c: number
  weather_description: Nullable<string>
  weather_symbol: Nullable<string>
}

const getForecastWeatherFromCodename = (
  codename?: WeatherCodename
): Nullable<ForecastWeather> => {
  if (!codename) {
    return null
  }

  return {
    codename,
    icon_url: getWeatherIconUrl(codename),
    theme: weatherTheme[codename]
  }
}

const getForecastWeatherFromWeatherId = (
  id: number
): Nullable<ForecastWeather> => {
  return getForecastWeatherFromCodename(weatherId[id.toString()])
}

const getForecastWeather = (
  weather: Nullable<WeatherForecast>
): Nullable<ForecastWeather> => {
  // TODO: Need to work out some kind of "average" weather for the day
  const weatherId = weather?.list[4]?.weather[0]?.id ?? 0

  return getForecastWeatherFromWeatherId(weatherId)
}

const useForecastWeather = (): Nullable<ForecastWeather> => {
  const loaderData = useRouteLoaderData<typeof forecastLoader>(
    "routes/forecast+/$slug"
  )

  const loaderWeather = loaderData?.weather

  const completionEvent = useForecastCompletionEvent()

  if (loaderWeather) {
    return loaderWeather
  }

  if (completionEvent?.weather) {
    return completionEvent.weather
  }

  return null
}

const getWeatherSymbolFromId = (id: number): Nullable<string> => {
  const codename = weatherId[id]

  if (!codename) {
    return null
  }

  return weatherSymbol[codename]
}

const getForecastWeatherHourly = (
  weather: Nullable<WeatherForecast>
): ForecastWeatherHourlySummary[] => {
  return (weather?.list ?? []).map((hourly) => {
    return {
      time: formatTime(hourly.dt_txt),
      chance_of_rain: hourly.pop * 100,
      temp_c: Math.round(hourly.main.temp * 2) / 2,
      weather_description: hourly.weather[0]?.description ?? null,
      weather_symbol: getWeatherSymbolFromId(hourly.weather[0]?.id ?? 0)
    }
  })
}

const formatTime = (datetime: string): string => {
  const hour = new Date(datetime).getHours()

  return `${hour.toString().padStart(2, "0")}00`
}

export {
  getForecastWeather,
  getForecastWeatherFromCodename,
  getForecastWeatherFromWeatherId,
  useForecastWeather,
  getWeatherSymbolFromId,
  getForecastWeatherHourly,
  formatTime
}

export type { ForecastWeather }
