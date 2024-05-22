import { useRouteLoaderData } from "@remix-run/react"
import type { loader as forecastLoader } from "~/routes/forecast+/$slug"
import {
  getWeatherIconUrl,
  weatherCode,
  weatherId,
  weatherTheme,
  weatherSymbol
} from "~/lib/weather"
import type { WeatherCodename } from "~/lib/weather"
import type { Nullable } from "~/lib/core"

interface ForecastWeather {
  codename: WeatherCodename
  icon_url: string
  theme: string
}

const getForecastWeather = (
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

const getForecastWeatherFromWeatherCode = (
  code: string
): Nullable<ForecastWeather> => {
  return getForecastWeather(weatherCode[code])
}

const getForecastWeatherFromWeatherId = (
  id: number
): Nullable<ForecastWeather> => {
  return getForecastWeather(weatherId[id.toString()])
}

const useForecastWeather = (): Nullable<ForecastWeather> => {
  const loaderData = useRouteLoaderData<typeof forecastLoader>(
    "routes/forecast+/$slug"
  )

  const weather = loaderData?.weather

  if (!weather) {
    return null
  }

  return weather
}

const getWeatherSymbolFromCode = (code: string): Nullable<string> => {
  if (!code) {
    return null
  }

  const codename = weatherCode[code]

  if (!codename) {
    return null
  }

  return weatherSymbol[codename]
}

const getWeatherSymbolFromId = (id: number): Nullable<string> => {
  const codename = weatherId[id]

  if (!codename) {
    return null
  }

  return weatherSymbol[codename]
}

const formatTime = (datetime: string): string => {
  const hour = new Date(datetime).getHours()

  return hour.toString().padStart(2, "0") + "00"
}

export {
  getForecastWeather,
  getForecastWeatherFromWeatherCode,
  getForecastWeatherFromWeatherId,
  useForecastWeather,
  getWeatherSymbolFromCode,
  getWeatherSymbolFromId,
  formatTime
}

export type { ForecastWeather }
